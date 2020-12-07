"ui";
"use strict";

/*
    SkyAutoPlayer-BR (Auto.js script)
  © 2020 mod by dream~
    Contatos : 
    (Wpp: +55 88 99495-3035)
    (Email: iamjunioru@gmail.com)
    (Twitter: @O_DR3AM3R)
    (Gitee: iamjunioru)
    (Github: iamjunioru)
    (...)

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  This library is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this library; if not, write to the Free Software
  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
  USA
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
        return "console.show();console.log(\"Falha ao carregaro script\")";
      }
  }
  }()));
});
emitter.on('evaluate', function(s){
  eval(s);
});
