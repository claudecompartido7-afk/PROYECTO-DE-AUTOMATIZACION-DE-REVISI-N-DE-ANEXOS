import zipfile,re,json,sys

CELDA = re.compile(r'<c\b([^>]*?)(?:/>|>(.*?)</c>)', re.S)
REF   = re.compile(r'r="([A-Z]+)\d+"')

def des(t):
    return (t.replace('&lt;','<').replace('&gt;','>').replace('&quot;','"')
             .replace('&apos;',"'").replace('&amp;','&').replace('_x000D_',''))

def leer(path):
    z=zipfile.ZipFile(path)
    wb=z.read('xl/workbook.xml').decode('utf-8')
    rels=z.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    rid={m.group(1):m.group(2) for m in re.finditer(r'Id="(rId\d+)"[^>]*Target="([^"]+)"',rels)}
    hojas=[(m.group(1),m.group(2)) for m in re.finditer(r'<sheet[^>]*name="([^"]+)"[^>]*r:id="(rId\d+)"',wb)]
    sst=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        x=z.read('xl/sharedStrings.xml').decode('utf-8')
        for si in re.findall(r'<si>(.*?)</si>',x,re.S):
            sst.append(des(''.join(re.findall(r'<t[^>]*>(.*?)</t>',si,re.S))))
    out={}
    for nom,r in hojas:
        tgt=rid[r]; p = tgt.lstrip('/') if tgt.startswith('/') else 'xl/'+tgt
        if p not in z.namelist(): continue
        xml=z.read(p).decode('utf-8')
        filas={}
        for fm in re.finditer(r'<row[^>]*r="(\d+)"[^>]*(?:/>|>(.*?)</row>)',xml,re.S):
            n=int(fm.group(1)); cuerpo=fm.group(2) or ""
            cel={}
            for cm in CELDA.finditer(cuerpo):
                at=cm.group(1); body=cm.group(2) or ""
                mr=REF.search(at)
                if not mr: continue
                col=mr.group(1)
                t=re.search(r'<is>.*?<t[^>]*>(.*?)</t>',body,re.S)
                v=re.search(r'<v>(.*?)</v>',body,re.S)
                if t: cel[col]=des(t.group(1))
                elif v:
                    val=v.group(1)
                    if 't="s"' in at and val.isdigit() and int(val)<len(sst): cel[col]=sst[int(val)]
                    else: cel[col]=des(val)
            if cel: filas[n]=cel
        out[nom]=filas
    return out

if __name__=="__main__":
    d=leer(sys.argv[1])
    json.dump({k:{str(a):b for a,b in v.items()} for k,v in d.items()},open(sys.argv[2],'w'),ensure_ascii=False)
    tot=sum(1 for v in d.values() for f in v.values() if f.get('B','').strip())
    print("hojas: %d   celdas B con contenido: %d"%(len(d),tot))
