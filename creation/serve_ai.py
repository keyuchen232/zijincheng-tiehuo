"""Loopback-only image-edit bridge. Credentials stay in the imagegen child process."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import world_api
import argparse, base64, binascii, hashlib, importlib.util, json, os, pathlib, secrets, struct, subprocess, sys, threading, tomllib, urllib.parse, uuid

ROOT = pathlib.Path(__file__).resolve().parent
WORKSPACE = ROOT.parents[1]
WRAPPER = WORKSPACE / 'tools/image-api/generate.py'
TOKEN = secrets.token_urlsafe(32)
LOCK = threading.Lock()
TEXT_LOCK = threading.Lock()
PORT = 8326

def result_dimensions(image, requested):
    """Accept provider-native resolution only when it preserves the requested framing."""
    if len(image) < 24 or image[:8] != b'\x89PNG\r\n\x1a\n' or image[12:16] != b'IHDR':
        raise ValueError('Invalid PNG')
    actual = struct.unpack('>II', image[16:24])
    width, height = actual
    rw, rh = map(int, requested.split('x'))
    if not (640 <= width <= 4096 and 640 <= height <= 4096 and width*height <= 16000000 and abs((width/height)/(rw/rh)-1) <= .01):
        raise ValueError('Invalid result framing')
    return actual

def cached_render(req, digest):
    """Only reuse a byte-identical input and exactly the same creative request."""
    for job in (ROOT/'.local-renders').glob('*'):
        try:
            previous = json.loads((job/'request.json').read_text(encoding='utf-8'))
            if previous.pop('sourceSha256', None) != digest or previous != req:
                continue
            image = (job/'result.png').read_bytes()
            dims = result_dimensions(image, req['size'])
            (job/'status.json').write_text(json.dumps({'status':'complete','model':'gpt-image-2','quality':'medium','actualSize':dims,'reused':True,'resultSha256':hashlib.sha256(image).hexdigest()}))
            return image
        except (OSError, ValueError, TypeError, struct.error):
            continue
    return None

def available():
    try:
        config = pathlib.Path(os.environ.get('CODEX_HOME', str(pathlib.Path.home()/'.codex'))) / 'config.toml'
        settings = tomllib.loads(config.read_text(encoding='utf-8-sig'))
        provider = settings['model_providers'][settings['model_provider']]
        cli = WORKSPACE/'tools/image-api/image_gen.py'
        if not cli.is_file(): cli = config.parent/'skills/.system/imagegen/scripts/image_gen.py'
        dep = WORKSPACE/'tmp/imagegen-deps'
        return bool(os.environ.get(provider.get('env_key', '')) and cli.is_file() and WRAPPER.is_file() and (importlib.util.find_spec('openai') or (dep/'openai').is_dir()))
    except (OSError, KeyError, ValueError):
        return False

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # Never log request bodies, prompts or provider errors.

    def reply(self, status, data, content_type='application/json; charset=utf-8'):
        body = json.dumps(data, ensure_ascii=False).encode() if isinstance(data, dict) else data
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cross-Origin-Resource-Policy', 'same-origin')
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def local(self):
        return self.headers.get('Host') in {f'127.0.0.1:{PORT}', f'localhost:{PORT}'}

    def do_GET(self):
        if not self.local():
            return self.reply(403, {'error': '仅允许本机访问'})
        path = urllib.parse.urlsplit(self.path).path
        if path == '/api/status':
            return self.reply(200, {'available': available(), 'token': TOKEN, 'mode': 'world-and-image', 'model': 'gpt-image-2', 'textAvailable': world_api.status()[0], 'textModel': world_api.status()[1], 'version': '0.10'})
        # Only ship the self-contained artifact, not source, credentials or local render archives.
        if path not in ('/', '/index.html'):
            return self.reply(404, {'error': '未找到'})
        return self.reply(200, (ROOT/'index.html').read_bytes(), 'text/html; charset=utf-8')

    def do_POST(self):
        if not self.local() or self.headers.get('Origin') not in {f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}'} or not secrets.compare_digest(self.headers.get('X-Wanxiang-Token', ''), TOKEN):
            return self.reply(403, {'error': '请从本机试玩页面发起转绘'})
        if self.path == '/api/shutdown':
            self.reply(200, {'stopping': True})
            threading.Thread(target=self.server.shutdown, daemon=True).start()
            return
        if self.path == '/api/world/generate':
            return self.generate_world()
        if self.path != '/api/artwork/render':
            return self.reply(404, {'error': '未找到'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            return self.reply(400, {'error': '请求长度无效'})
        if not 0 < size <= 8*1024*1024 or self.headers.get_content_type() != 'application/json':
            return self.reply(413, {'error': '请求必须为小于 8 MB 的 JSON'})
        self.connection.settimeout(30)
        try:
            body = json.loads(self.rfile.read(size))
            req = body['request']
            expected = {'axis': ((1040, 896), '1040x896'), 'current': ((640, 360), '1280x720')}[req['view']]
            if req['version'] != 2 or req['type'] != 'wanxiang.image-edit' or req['style'] not in ('jade', 'ink', 'paper') or req['size'] != expected[1]:
                raise ValueError()
            prompt = req['prompt']
            if not isinstance(prompt, str) or not 20 <= len(prompt) <= 8000:
                raise ValueError()
            png = base64.b64decode(body['imageBase64'], validate=True)
            if png[:8] != b'\x89PNG\r\n\x1a\n' or png[12:16] != b'IHDR' or struct.unpack('>II', png[16:24]) != expected[0]:
                raise ValueError()
        except (KeyError, TypeError, ValueError, binascii.Error, struct.error, OSError):
            return self.reply(400, {'error': '原图或场景档案无效，请重新打开作品页'})
        if not available():
            return self.reply(503, {'error': '本机图片 CLI、依赖或密钥环境变量未就绪，请查看启动.md'})
        if not LOCK.acquire(blocking=False):
            return self.reply(409, {'error': '已有一张图正在转绘，请等待完成后再试'})
        try:
            digest = hashlib.sha256(png).hexdigest()
            cached = cached_render(req, digest) if body.get('reuse', True) is True else None
            if cached is not None:
                return self.reply(200, cached, 'image/png')
            job = ROOT/'.local-renders'/uuid.uuid4().hex
            job.mkdir(parents=True)
            (job/'source.png').write_bytes(png)
            (job/'prompt.txt').write_text(prompt, encoding='utf-8')
            req['sourceSha256'] = digest
            (job/'request.json').write_text(json.dumps(req, ensure_ascii=False, indent=2), encoding='utf-8')
            command = [sys.executable, str(WRAPPER), '--image', str(job/'source.png'), '--prompt-file', str(job/'prompt.txt'), '--out', str(job/'result.png'), '--size', req['size'], '--quality', 'medium']
            result = subprocess.run(command, capture_output=True, timeout=380, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            (job/'cli.log').write_bytes(result.stdout + b'\n' + result.stderr)
            if result.returncode or not (job/'result.png').is_file():
                (job/'status.json').write_text(json.dumps({'status':'failed', 'exitCode':result.returncode}))
                return self.reply(502, {'error': '图片服务未返回可用结果，请检查服务商额度、模型与网络；原图已留存。请勿连续重复提交'})
            image = (job/'result.png').read_bytes()
            try:
                dims = result_dimensions(image, req['size'])
            except ValueError:
                (job/'status.json').write_text(json.dumps({'status':'failed', 'reason':'invalid-result'}))
                return self.reply(502, {'error': '服务商返回的图片格式或尺寸不符合约定，原图与任务已保留'})
            (job/'status.json').write_text(json.dumps({'status':'complete', 'model':'gpt-image-2', 'quality':'medium', 'actualSize':dims, 'resultSha256':hashlib.sha256(image).hexdigest()}))
            return self.reply(200, image, 'image/png')
        except subprocess.TimeoutExpired:
            (job/'status.json').write_text(json.dumps({'status':'timeout'}))
            return self.reply(504, {'error': '转绘超时，请先检查服务商任务与计费状态，再决定是否重试'})
        except OSError:
            return self.reply(500, {'error': '本机无法保存或运行转绘任务，请检查目录与 Python 环境'})
        finally:
            LOCK.release()

    def generate_world(self):
        if not world_api.status()[0]:
            return self.reply(503, {'error':'文本服务尚未配置；可选择本地规则或 AI 离线样例'})
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 16000 or self.headers.get_content_type() != 'application/json':
                return self.reply(400, {'error':'请求必须为小于 16 KB 的 JSON'})
            self.connection.settimeout(30)
            request = world_api.validate_input(json.loads(self.rfile.read(size)))
        except (ValueError, TypeError, world_api.PlanError) as e:
            return self.reply(400, {'error':'创作请求字段无效'})
        if not TEXT_LOCK.acquire(blocking=False):
            return self.reply(409, {'error':'已有世界正在编排，请等待后再试'})
        try:
            data = world_api.generate(request)
            job = ROOT/'.local-worlds'/uuid.uuid4().hex
            job.mkdir(parents=True)
            (job/'request.json').write_text(json.dumps(request,ensure_ascii=False,indent=2),encoding='utf-8')
            (job/'result.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
            return self.reply(200,data)
        except world_api.PlanError as e:
            return self.reply(502, {'error':str(e)})
        except Exception:
            return self.reply(500, {'error':'本机文本服务异常，请检查配置与运行环境'})
        finally:
            TEXT_LOCK.release()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8326)
    PORT = parser.parse_args().port
    print(f'Wanxiang v0.10: http://127.0.0.1:{PORT} (AI ready: {available()})', flush=True)
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
