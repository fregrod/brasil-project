import concurrent.futures,datetime,json,time,urllib.request,urllib.error,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
docs=json.loads((root/'src/data/documents.json').read_text())
links={}
for doc in docs:
 for link in doc['sources']: links.setdefault(link['url'],[]).append(doc['path'])
def check(item):
 url,paths=item
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'BrasilProjectResearch/1.0','Range':'bytes=0-2047'}),timeout=9) as r:
   r.read(2048);return {'url':url,'status':r.status,'finalUrl':r.url,'documents':sorted(set(paths))}
 except urllib.error.HTTPError as e:return {'url':url,'status':e.code,'documents':sorted(set(paths))}
 except Exception as e:return {'url':url,'status':'network_error','reason':str(e),'documents':sorted(set(paths))}
start=time.time();results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=14) as executor:
 for i,result in enumerate(executor.map(check,links.items())):
  results.append(result)
  if i%70==0:print(i+1,'/',len(links),flush=True)
payload={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'HTTP access only; status 200 does not certify content. Blocking, redirects and temporary failure require human interpretation.','results':results}
(root/'.audit/source-access.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2))
from collections import Counter
print(Counter(str(x['status']) for x in results),'seconds',round(time.time()-start),flush=True)
print(json.dumps([{'url':r['url'],'status':r['status']} for r in results if r['status'] in [404,410] ],ensure_ascii=False,indent=2))
