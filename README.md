# SkyAutoPlayer-BR

# - O que é SkyAutoPlayer?
Um script para reproduzir as planilhas geradas pelo SkyStudio automaticamente no jogo Sky com serviços de acessibilidade usando Auto.js
</br> Use as permissões sem limitações fornecidas pelo Auto.js para jogar automaticamente no Sky. <br> [SkyStudio] (https://play.google.com/store/apps/details?id=com.Maple.SkyStudio).

## - Características
Comparado com outros scripts, SkyAutoPlayerScript tem as seguintes vantagens:

* Operação de interface completa, sem a necessidade de editar qualquer código ou animação de UI.
* Painel de controle de reprodução completo, suporte para **pausa**, **controle de progresso**,**controle duplo de velocidade** etc.
* Auto-definir as coordenadas da posição das teclas para evitar o problema de deslocamento ao pressionar as teclas.
* Online [folhas compartilhadas] (https://github.com/iamjunioru/SkyAutoPlayer-BR/tree/main/shared_sheets), há muitas partituras de alta qualidade. ~~(Algumas partituras são tão complicadas que não podem ser tocadas)~~
* Atualizações automáticas, não precisa se preocupar com a versão desatualizada.

## - Como usar
<br> ①Auto.js `4.1.1 Alpha2 (461) ` ~ download da versão: [` Ericwyn / Auto.js / releases @ V4.1.1.Alpha2`] (https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2)
<br> Baixe o `Auto.js` [` Ericwyn / Auto.js / releases @ V4.1.1.Alpha2`] (https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2)
<br> Página de download para Android: `autoJs-V4.1.1.Alpha2-common-armeabi-v7a-debug.apk`
<br> **Faça o download aqui:**  `autoJs-V4.1.1.Alpha2-common-armeabi-v7a-debug.apk`
<br> ② Abra **Serviços de acessibilidade** e ative **Permissão de janela flutuante** para o Auto.js.
<br> ③ **Crie um novo script em Auto.js, cole o seguinte código e execute**
<br> Crie um novo arquivo de script em Auto.js. Copie o código abaixo e execute:
```javascript
"ui";
"use strict";

/*
    SkyAutoPlayer-BR (Auto.js script)
  © 2020 scriptmod by dream~@iamjunioru
    Contatos : 
    (Discord: dream#2001)
    (Email: iamjunioru@gmail.com)
    (Twitter: @O_DR3AM3R)
    (Gitee: iamjunioru)
    (Github: iamjunioru)
    
 */

var emitter = events.emitter(threads.currentThread());
threads.start(function() {
  emitter.emit("evaluate", (function(){
    var resp = http.get("https://gitee.com/iamjunioru/SkyAutoPlayer-BR/raw/main/source/SkyAutoPlayer.js");
    if(resp.statusCode >= 200 && resp.statusCode < 300) {
      return resp.body.string();
    } else {
      resp = http.get("https://cdn.jsdelivr.net/gh/iamjunioru/SkyAutoPlayer-BR@" + http.get("https://gitee.com/iamjunioru/SkyAutoPlayer-BR/raw/main/gitVersion").body.string() + "/source/SkyAutoPlayer.js");
      if(resp.statusCode >= 200 && resp.statusCode < 300) {
        return resp.body.string();
      } else {
        return "console.show();console.log(\"Falha ao carregar o script\")";
      }
  }
  }()));
});
emitter.on('evaluate', function(s){
  eval(s);
});

/* epa */
```

* Foi testado na versão `4.1.1 Alpha2 (461)` do Auto.js, a compatibilidade de outras versões não é garantida então pode ser que outras versões tenham `mudanças significativas` em relação a esta versão da API.

## - Apagar os dados
O `SkyAutoPlayerScript` irá gerar armazenamento de dados local para poder usá-lo, se você quiser excluir tudo, use o Auto.js para executar o seguinte código:

```javascript
storages.remove("StageGuard:SkyAutoPlayer:Config");
files.removeDir("/storage/emulated/0/Documents/SkyAutoPlayer/");
```

<br>

# - Upload de partitura

Você pode interagir neste repositório e adicionar a partitura que deseja enviar para a pasta `shared_sheets` e adicionar itens em` shared_sheets.json` de acordo com os seguintes requisitos:

```javascript
{
    // Nome da partitura
    "name": "SheetName",
    // Nome do arquivo de partitura (na pasta shared_sheets)
    "file": "SheetName.txt",
    //Sua identificação
    "author": "Autor",
    // Descrição da partitura
    "desc": "Coloca uma descrição fod@ aqui",
    // BPM(batidas por minuto) da partitura
    "bpm": 320,
    // temporariamente inutil, deixe o valor como 1 para não dar problema
    "suggested_instrument": 1,
    // Número de teclas(escolha entre 8 teclas ou 15 teclas)
    "keyCount": 15,
    // pitch da partitura
    "pitchLevel": 0
  }
```

Após a conclusão da modificação, solicite o `Pull Request` e aguarde a fusão.
> Observação: antes de aplicar para `Pull Request`, certifique-se de que seu repositório SkyAutoPlayerScript foi sincronizado com o mais recente para evitar problemas inesperados!

<br>


