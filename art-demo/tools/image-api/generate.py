"""Use the bundled imagegen CLI with the existing Codex provider configuration."""
import argparse, os, pathlib, subprocess, sys, tomllib
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')
parser = argparse.ArgumentParser()
parser.add_argument('--prompt-file', required=True)
parser.add_argument('--out', required=True)
parser.add_argument('--image', help='PNG/JPEG/WebP edit target; switches to images/edits')
parser.add_argument('--size', default='1024x1024')
parser.add_argument('--dry-run', action='store_true')
parser.add_argument('--model', default='gpt-image-2')
parser.add_argument('--quality', default='low', choices=['low','medium','high','auto'])
a = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[2]
config = pathlib.Path(os.environ.get('CODEX_HOME', str(pathlib.Path.home()/'.codex')))/'config.toml'
with config.open('rb') as f: settings=tomllib.load(f)
provider=settings['model_providers'][settings['model_provider']]
key_name=provider.get('env_key')
key=os.environ.get(key_name or '')
if not key: sys.exit('The provider credential environment variable is unavailable. Restart the terminal after configuring it.')
env=os.environ.copy()
env['OPENAI_API_KEY']=key
env['OPENAI_BASE_URL']=provider['base_url']
env['PYTHONIOENCODING']='utf-8'
env['PYTHONUTF8']='1'
env['PYTHONPATH']=str(root/'tmp'/'imagegen-deps')+os.pathsep+env.get('PYTHONPATH','')
cli=config.parent/'skills'/'.system'/'imagegen'/'scripts'/'image_gen.py'
if not cli.is_file(): sys.exit('Bundled imagegen CLI not found.')
print('Using provider:',settings['model_provider'],'model:',a.model,flush=True)
command=[sys.executable,str(cli),'edit' if a.image else 'generate','--model',a.model,'--prompt-file',a.prompt_file,'--out',a.out,'--size',a.size,'--quality',a.quality,'--no-augment']
if a.image: command.extend(['--image',a.image])
if a.dry_run: command.append('--dry-run')
try:
 result=subprocess.run(command,env=env,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=360)
 # Never forward a provider's error body without masking known credentials.
 output=(result.stdout+'\n'+result.stderr).replace(key,'[REDACTED]')
 print(output)
 sys.exit(result.returncode)
except subprocess.TimeoutExpired:
 sys.exit('Image request timed out after 360 seconds. Check provider billing/status before retrying.')
