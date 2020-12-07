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

const user_agreements = 
	"Por favor, leia as instruções a seguir!\n\n" + 
	"Se você encontrar algum bug, ​​envie uma mensagem privada para @iamjunioru ou crie um novo issue em iamjunioru/SkyAutoPlayer-BR no github para enviar um feedback sobre o bug.\n\n" + 
	"1. SkyAutoPlayer(Doravante referido como \"Este Script\") É um software/script totalmente gratuito - open source(https://github.com/iamjunioru/SkyAutoPlayer-BR). O uso deste script para fins lucrativos é proibido！\n((Se você comprou este script de outras fontes, você foi enganado.))\n\n" + 
	"2. Este script só pode ser usado para fins de entretenimento, por favor, não use este script em ocasiões formais(para se beneficiar). Se houver alguns problemas devido ao uso deste script，não tem nada a ver comigo - autor/modder do script ~@iamjunioru (doravante referido como \"dream#2001\").\n\n" + 
	"3. Os scripts podem dar a você uma sensação de satisfação, mas não de progresso, então use-o de forma adequada, lembre que apenas o esforço e dedicação real pode fazer você feliz. :)\n\n" + 
	"4. Este script é apenas um \"game machine\"，sem partituras incorporados em si，você precisa baixar ou fazer as composições do SkyStudio.\n\n" + 
	"5. Este script não tem a função de descriptografar partituras, ele se limita a partituras não-criptografadas do SkyStudio, conseguindo ler JS não-criptografado pelo app e etc. também não aceita o compartilhamento de partituras criptografadas.\n\n" + 
	"6. A distribuição deste script está em conformidade com o contrato LGPL-2.1. Se você não souber o conteúdo do contrato, visite https://www.gnu.org/licenses para visualizar.\n\n" +
	"• Deu bastante trabalho adaptar isso tudo, espero que gostem.\n  ~Júnior Sousa"
;

//script global scope
const scope = this;
//contexto de atividade
const ctx = activity;

//interface global
var gui = null;
//SimpleListAdapter(gitee@projectXero)
var RhinoListAdapter;
//gerenciador de sheets
var sheetmgr = null;
//sheets player
var sheetplayer = null;
//carregar configuração e recursos
var config = null;
//densidade da tela
scope.dp = context.getResources().getDisplayMetrics().density;
//mostrar erro;
const error = function(text) {
	console.show();
	console.error("Ocorreu um erro no SkyAutoPlayer, envie uma mensagem privada para @iamjunioru ou crie um novo issue no StageGuard/SkyAutoPlayerScript no github para relatar esse bug!\ndetalhes：" + text);
};

//script de carregamento assíncrono
threads.start(function() {
	
sheetmgr = {
	rootDir: android.os.Environment.getExternalStorageDirectory() + "/Android/data/com.Maple.SkyStudio/files/Sheet/",
	encoding: "x-UTF-16LE-BOM",
	
	cachedLocalSheetList: [],
	cachedOnlineSharedSheetInfoList: [],
	
	getLocalSheetList: function(forceRefresh, listener) {
		if(this.cachedLocalSheetList.length == 0 || forceRefresh) {
			this.__internal_fetchLocalSheets(listener);
		}
		return this.cachedLocalSheetList;
	},
	getOnlineSharedSheetInfoList: function(forceRefresh) {
		if(this.cachedOnlineSharedSheetInfoList.length == 0 || forceRefresh) {
			this.__internal_fetchOnlineSharedSheets();
		}
		return this.cachedOnlineSharedSheetInfoList;
	},

	filterOnlineSharedSheet: function(filterBlock) {
		var resultList = [];
		this.getOnlineSharedSheetInfoList().map(function(element, index) {
			if(filterBlock(element)) resultList.push(element);
		});
		return resultList;
	},
	
	downloadAndLoad: function(file, extraData, listener) {
		listener({status:1});
		config.fetchRepoFile("shared_sheets/" + file, null, function(body) {
			var sheet = files.join(sheetmgr.rootDir, files.getNameWithoutExtension(file) + (function(length) {
				var string = "0123456789abcde";
				var stringBuffer = new java.lang.StringBuffer();
				for (var i = 0; i < length; i++) {
					stringBuffer.append(string.charAt(Math.round(Math.random() * (string.length - 1))));
				}
				return stringBuffer.toString();
			} (7)) + ".txt");

			var parsed;
			files.write(sheet, parsed = (function() {
				var data = eval(body.string())[0];
				listener({status:2});
				data.author = extraData.author;
				data.keyCount = extraData.keyCount;
				return "[" + JSON.stringify(data) + "]";
			}()), sheetmgr.encoding);
			parsed = eval(parsed)[0];
			parsed.fileName = sheet;
			sheetmgr.cachedLocalSheetList.push(parsed);
			listener({status:3});
		}, function (msg) {
			listener({status:-1, msg: "Obtivemos " + remoteHost + " Falha, motivo：" + resp.statusMessage});
		});
	},
	
	__internal_fetchLocalSheets: function(listener) {
		var sheets = files.listDir(this.rootDir, function(name){return name.endsWith(".txt");});
		this.cachedLocalSheetList.length = 0;
		var failed = 0;
		for(var i in sheets) {
			try {
				var readable = files.open(files.join(this.rootDir, sheets[i]), "r", this.encoding);
				var parsed = eval(readable.read())[0];
				readable.close();
				//parsed.songNotes = this.parseSongNote(parsed.songNotes);
				
				if(typeof(parsed.songNotes[0]) == "number" || parsed.isEncrypted) {
					//failed type = 1 para carregar a partitura JSON criptografada
					parsed = {failed: true, errtype: 1, fileName: sheets[i], reason: "It is a encrypted JSON sheet."};
					failed ++;
				} else {
					parsed.fileName = sheets[i];
				}
				this.cachedLocalSheetList.push(parsed);
			} catch (e) {
				failed ++;
				//failed type = 2 formato errado para JSON
				//failed type = -1 erro desconhecido
				this.cachedLocalSheetList.push({failed: true, errtype: /illegal character/.test(String(e)) ? -1 : (/SyntaxError/.test(String(e)) ? 2 : -1), fileName: sheets[i], reason: e});
			}
			if(listener != null) listener(Number(i) + 1, failed);
		}
	},
	__internal_fetchOnlineSharedSheets: function() {
		config.fetchRepoFile("shared_sheets.json", config.values.gitVersion, function(body) {
			sheetmgr.cachedOnlineSharedSheetInfoList = body.json().sheets;
		});
	},
	//analisar partituras de música é uma operação demorada kkk
	parseSongNote: function(raw) {
		var r = [];
		var t_time = 0;
		var t_sets = [];
		const regexp = /^(\d)Key(\d{1,})$/;
		for(var i in raw) {
			var key = Number(raw[i].key.replace(regexp, "$2"));
			if(raw[i].time != t_time) {
				r.push({time: t_time, keys: t_sets});
				t_sets = [];
				t_time = raw[i].time;
			}
			if(t_sets.indexOf(key) == -1) t_sets.push(key);
		}
		r.push({time: t_time, keys: t_sets});
		return r;
	},
	
	pitch_suggestion: [{
		name: "C",
		places: ["Na entrada do castelo, no fim do sertão", "Cemitério do sertão", "No final da Floresta Oculta, após o templo"]
	}, {
		name: "D♭",
		places: ["Portão de 8 pessoas", "Lugar onde aparece a baleia na Floresta Oculta antes de surgir as água-vivas" ]
	}, {
		name: "D",
		places: ["Tunel esferico da Campina(indo para Aldeia)", "O início da Floresta Oculta(não voe para baixo)",
				"Plataforma de meditação da cidadela", "Sertão, no antigo campo de batalha"]
	}, {
		name: "E♭",
		places: ["Dentro do buraco em arco à direita - atrás do primeiro portão da Floresta Oculta", "Templo destruído do Sertão"]
	}, {
		name: "E",
		places: ["Estrada para o renascimento(Eden)"]
	}, {
		name: "F",
		places: ["Area oculta à direita da floresta", "Cidadela do Vale", "1º Andar do Relicário"]
	}, {
		name: "G♭",
		places: ["Após o diagrama de arraias da Floresta Oculta liberar aguas-vivas e raias presas"]
	}, {
		name: "G",
		places: ["Depois que as aguas-vivas flutuarem"]
	}, {
		name: "A♭",
		places: ["Fim da corrida - Vale do Triunfo"]
	}, {
		name: "A",
		places: ["Relicário do Conhecimento, 4º andar"]
	}, {
		name: "B♭",
		places: ["Na junção da Floresta Oculta com a entrada(cânion) do Vale, espere o fim da música de fundo"]
	}, {
		name: "B",
		places: ["Depois que as aguas-vivas flutuarem", "No vale, em qualquer local", "Relicário do Conhecimento, 2º andar"]
	}],
};

sheetplayer = {
	
	notes: [],
	bpm: [],
	noteCount: 0,
	name: "",
	pitch: 0,
	
	currentNote: 0,
	playing: false,
	nextInterval: 0,

	keyCount: 15,
	
	speed: 1,
	current_speed_index: 9,
	speed_list: [
		0.1, 
		0.2, 
		0.3,
		0.4, 
		0.5, 
		0.6, 
		0.7,
		0.8,
		0.9,
		1, 
		1.1,
		1.2, 
		1.3, 
		1.4, 
		1.5, 
		1.6,
		1.7,
		1.8, 
		1.9,
		2,
		3,
		4, 
		5
	],
	
	thread: null,
	
	play: function(listener) {
		if(this.playing == true) return;
		this.playing = true;
		
		this.thread = threads.start(function() {
			var executor = java.util.concurrent.Executors.newCachedThreadPool();
			var tragetRunnable = new java.lang.Runnable({
				run: function() {
					var gestureMap = [];
					sheetplayer.notes[sheetplayer.currentNote].keys.map(function(e, i) {
						var keyCoordinates = sheetplayer.keyCount == 15 ? [config.values.key_coordinates15[e][0], config.values.key_coordinates15[e][1]] : [config.values.key_coordinates8[e][0], config.values.key_coordinates8[e][1]];
						gestureMap.push([0, 25, keyCoordinates, keyCoordinates]);
					});
					gestureMap = sheetplayer.toSource(gestureMap);
					eval("gestures(" + gestureMap.slice(1, gestureMap.length - 1) + ");");
				}
			});
			while(sheetplayer.playing && sheetplayer.currentNote < sheetplayer.noteCount) {
				if((sheetplayer.currentNote + 1) == sheetplayer.noteCount) {
					sheetplayer.nextInterval = sheetplayer.notes[sheetplayer.currentNote].time - sheetplayer.notes[sheetplayer.currentNote - 1].time;
				} else {
					sheetplayer.nextInterval = sheetplayer.notes[sheetplayer.currentNote + 1].time - sheetplayer.notes[sheetplayer.currentNote].time;
				}
				executor.execute(tragetRunnable);
				if(listener != null) listener();
				java.lang.Thread.sleep(sheetplayer.nextInterval = Math.round(sheetplayer.nextInterval *  sheetplayer.speed));
				sheetplayer.currentNote ++;
			}
			// próxima música automática após tocar

			if(!(sheetplayer.currentNote < sheetplayer.noteCount)) {
				if(config.values.autoPlay && gui.player_panel.isShowing) {
					gui.player_panel.__internal_dismiss();
					sheetplayer.stop();
					// gui.main.show(0);
					if(sheetmgr.cachedLocalSheetList.length>0){
						setTimeout(function(){
							let sheet = sheetmgr.cachedLocalSheetList[random(0, sheetmgr.cachedLocalSheetList.length-1)]
							if(!sheet.keyCount){
								sheet.keyCount = 15 //posição-tecla padrão
							}
							gui.player_panel.__internal_showPanel(sheet);
							// sheetplayer.stop();
							setTimeout(function(){
								sheetplayer.play(gui.player_panel.refreshStatus);
							}, 1500)
						}, 500)
					}
				} else {
					sheetplayer.stop();
				}
			}
		});
	},
	
	stop: function() {
		this.playing = false;
		this.currentNote = 0;
		this.thread = null;
	},
	pause: function() {
		this.playing = false;
	},
	
	speed_up: function() {
		if((this.current_speed_index + 1) < this.speed_list.length) {
			this.speed = 1 / this.speed_list[++ this.current_speed_index];
		}
	},
	
	slow_down: function() {
		if((this.current_speed_index - 1) >= 0) {
			this.speed = 1 / this.speed_list[-- this.current_speed_index];
		}
	},
	
	setProgress: function(p) {
		this.currentNote = p;
	},
	
	setSheet: function(j) {
		if(this.thread != null) this.stop();
		this.thread = null;
		this.name = j.name;
		this.notes = sheetmgr.parseSongNote(j.songNotes);
		this.pitch = j.pitchLevel;
		this.bpm = j.bpm;
		this.noteCount = this.notes.length;
		this.keyCount = j.keyCount;
	},
	
	toSource: function(obj) {
		var _toJSON = function toJSON(x, lev) {
			var p = "", r, i;
			if (typeof x == "string") {
				return x;
			} else if (Array.isArray(x)) {
				r = new Array();
				for (i = 0; i < x.length; i++) r.push(toJSON(x[i], lev - 1));
				p = "[" + r.join(",") + "]";
			}  else {
				p = String(x);
			}
			return p;
		}
		return _toJSON(obj, 32);
	},
}

config = {
	
	_global_storage: null,
	
	values: {
		currentVersion: 0.4,
		gitVersion: "",
		
		key_coordinates15: [],
		key_coordinates8: [],
		skipRunScriptTip: false,
		skipOpenWindowTip: false,
		skipOpenPlayerPanelWindowTip: false,
		skipOnlineUploadTip: false,
		skipOnlineSharedSheetCTip: false,
		skipImportLocalSheetTip: false,
		skipChangeKeyCountTip: false,
		showFailedSheets: true,
		tipOnAndroidR: true,
		theme: "dark",
		autoPlay: false
	},
	
	bitmaps: {},
	
	init: function() {
		this._global_storage = storages.create("StageGuard:SkyAutoPlayer:Config");

		this.values.key_coordinates15 = this._global_storage.get("key_coordinates15", this.values.key_coordinates15);
		this.values.key_coordinates8 = this._global_storage.get("key_coordinates8", this.values.key_coordinates8);
		this.values.skipRunScriptTip = this._global_storage.get("skip_run_script_tip", this.values.skipRunScriptTip);
		this.values.skipOpenWindowTip = this._global_storage.get("skip_open_window_tip", this.values.skipOpenWindowTip);
		this.values.skipOpenPlayerPanelWindowTip = this._global_storage.get("skip_open_player_panel_window_tip", this.values.skipOpenPlayerPanelWindowTip);
		this.values.skipOnlineUploadTip = this._global_storage.get("skip_online_upload_tip", this.values.skipOnlineUploadTip);
		this.values.skipOnlineSharedSheetCTip = this._global_storage.get("skip_shared_sheet_c_tip", this.values.skipOnlineSharedSheetCTip);
		this.values.skipImportLocalSheetTip = this._global_storage.get("skip_import_local_sheet_tip", this.values.skipImportLocalSheetTip);
		this.values.skipChangeKeyCountTip = this._global_storage.get("skip_change_key_count_tip", this.values.skipChangeKeyCountTip);
		this.values.showFailedSheets = this._global_storage.get("show_failed_sheets", this.values.showFailedSheets);
		this.values.tipOnAndroidR = this._global_storage.get("tip_storage_on_android_r", this.values.tipOnAndroidR);
		this.values.theme = this._global_storage.get("theme", this.values.theme);
		this.values.autoPlay = this._global_storage.get("auto_play", this.values.autoPlay);
		try {
			android.os.Build.VERSION_CODES.R
			sheetmgr.rootDir = android.os.Environment.getExternalStorageDirectory() + "/Documents/SkyAutoPlayer/sheets/";
			if(this.values.tipOnAndroidR) toast("O Android 11 não permite que apps externos leiam pastas privadas de aplicativos, a pasta de pontuação é movida para" + sheetmgr.rootDir);
		} catch (e) {}

		files.ensureDir(sheetmgr.rootDir);

	},
	
	save: function(key, value) {
		var v = value == null ? this.values[key] : this.values[key] = value;
		this._global_storage.put(key, v);
		return v;
	},
	
	checkVersion: function() {
		this.values.gitVersion = http.get("https://gitee.com/iamjunioru/SkyAutoPlayer-BR/raw/master/gitVersion").body.string();
		var periodVersion = this._global_storage.get("version", this.values.currentVersion);
		var currentVersion = this.values.currentVersion;
		if(periodVersion < currentVersion) {
			config.fetchRepoFile("update_log.txt", this.values.gitVersion, function(body) {
				gui.dialogs.showConfirmDialog({
					title: "SkyAutoPlayer foi atualizado",
					text: "Versão Atual: " + currentVersion + " ← " + periodVersion + "\n\nLogs de atualização: \n" + body.string(),
					canExit: false,
					buttons: ["Confirmar"]
				});
			}, function(msg) {
				toast("A verificação da versão falhou, não obtivemos informações de atualização");
			});
		}
		this.save("version", currentVersion);
	},
	
	fetchResources: function(listener) {
		var remoteHost = "https://cdn.jsdelivr.net/gh/iamjunioru/SkyAutoPlayer-BR@" + this.values.gitVersion + "/resources/";
		var resourceList = ["local.png", "online.png", "play.png", "pause.png", "refresh.png", "settings.png", "info.png", "download.png", "bin.png", "speedup.png", "search.png", "note.png", "user.png", "piano.png", "clock.png"/*, "filter.png"*/, "coolapk.png", "douyin.png", "github.png", "twitter.png", "bilibili.png"];
		var localRootDir = android.os.Environment.getExternalStorageDirectory() + "/Documents/SkyAutoPlayer/bitmaps/";
		var downloadQueue = [];
		var tryCount = 1;
		try {
			files.createWithDirs(localRootDir);
			listener("Carregando recursos...");
			resourceList.map(function(element, i) {
				var absolutePath = files.join(localRootDir, element);
				if(files.exists(absolutePath)) {
					try {
						listener("Carregando recursos: " + element);
						config.bitmaps[files.getNameWithoutExtension(absolutePath)] = android.graphics.Bitmap.createBitmap(android.graphics.BitmapFactory.decodeFile(absolutePath));
					} catch(e) {
						listener("Falha ao carregar: " + element);
						downloadQueue.push(element);
					}
				} else {
					listener("Sem recursos locais, entre na fila de download: " + element);
					downloadQueue.push(element);
				}
			});
			if(downloadQueue.length == 0) {
				listener("Carregamento de recursos concluído!");
				java.lang.Thread.sleep(500); //p ficar mais fácil de ver
				return;
			}
			while (downloadQueue.length != 0 && tryCount <= 5) {
				listener(" " + tryCount + "- Tentando baixar recursos, um total de: " + downloadQueue.length + " recursos");
				java.lang.Thread.sleep(750); //Para tornar mais fácil de ver
				var tmpQueue = [];
				for(var i in downloadQueue) tmpQueue.push(downloadQueue[i]);
				var iterator = 0;
				tmpQueue.map(function(element, i) {
					listener("Baixando recursos: " + element);
					config.fetchRepoFile("resources/" + element, config.values.gitVersion, function(body) {
						var absolutePath = files.join(localRootDir, element);
						files.create(absolutePath);
						files.writeBytes(absolutePath, body.bytes());
						config.bitmaps[files.getNameWithoutExtension(absolutePath)] = android.graphics.Bitmap.createBitmap(android.graphics.BitmapFactory.decodeFile(absolutePath));
						downloadQueue.splice(iterator, 1);
					}, function(msg) {
						iterator++;
						listener("Recursos " + element + " Falha de download/carregamento: " + e);
						java.lang.Thread.sleep(500); //p ficar mais fácil de ver
					});
					
				});
				tryCount ++;
			}
			//resultado do processo
			if(tryCount > 5) {
				listener(new Error("Falha ao baixar os seguintes recursos: " + downloadQueue))
			} else {
				listener("Download de recursos completo!");
				java.lang.Thread.sleep(1000); //p ficar mais fácil de ver
			}
		} catch(error) {
			listener(new Error("Ocorreu um problema ao baixar os recursos" + error));
		}
		
	},
	//jsdelivr cdn precisa especificar a versão do repo, gitee e github não
	//A ordem de busca é conteúdo bruto do gitee → jsdelivr cdn → conteúdo bruto do github
	fetchRepoFile: function(path, gitVersion, successCbk, failCbk) {
		//basta usar o mais a
		var resp = http.get(encodeURI("https://gitee.com/iamjunioru/SkyAutoPlayer-BR/tree/main/" + path));
		if(resp.statusCode >= 200 && resp.statusCode < 300) {
			successCbk(resp.body);
			return;
		} else {
			var errorCollector = resp.statusCode + ": " + resp.statusMessage + "\n";
			resp = http.get(encodeURI("https://cdn.jsdelivr.net/gh/iamjunioru/SkyAutoPlayer-BR" + (gitVersion == null ? "" : ("@" + gitVersion)) + "/" + path));
			if(resp.statusCode >= 200 && resp.statusCode < 300) {
				successCbk(resp.body);
				return;
			} else {
				errorCollector += resp.statusCode + ": " + resp.statusMessage + "\n";
				resp = http.get(encodeURI("https://raw.githubusercontent.com/iamjunioru/SkyAutoPlayer-BR/master/" + path));
				if(resp.statusCode >= 200 && resp.statusCode < 300) {
					successCbk(resp.body);
					return;
				} else {
					errorCollector += resp.statusCode + ": " + resp.statusMessage + "\n";
					if(failCbk != null) failCbk(errorCollector);
				}
			}
		}
	},

	updateBitmapTheme: function() {
		var filterBitmap = function(bitmap, replacedColor) {
			var rBitmap = android.graphics.Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), android.graphics.Bitmap.Config.ARGB_8888);
			var canvas = new android.graphics.Canvas(rBitmap);
			var paint = new android.graphics.Paint();
			var rect = new android.graphics.Rect(0, 0, bitmap.getWidth(), bitmap.getHeight());
			paint.setAntiAlias(true);
			canvas.drawARGB(0, 0, 0, 0);
			paint.setColorFilter(new android.graphics.PorterDuffColorFilter(replacedColor, android.graphics.PorterDuff.Mode.SRC_IN));
			canvas.drawBitmap(bitmap, rect, rect, paint);
			return rBitmap;
		};
		for(var i in this.bitmaps) {
			this.bitmaps[i] = filterBitmap(this.bitmaps[i], this.values.theme == "dark" ? android.graphics.Color.WHITE : android.graphics.Color.BLACK);
		}
	}
	
}


RhinoListAdapter = (function() {
	var r = function(arr, vmaker, params, preload) {
		var src = arr.slice(),
			views = new Array(arr.length),
			dso = [],
			controller;
		if (preload) {
			src.forEach(function(e, i, a) {
				views[i] = vmaker(e, i, a, params);
			});
		}
		controller = new RhinoListAdapter.Controller(src, views, dso, vmaker, params, preload);
		return new android.widget.ListAdapter({
			getCount: function() {
				return src.length;
			},
			getItem: function(pos) {
				if (pos == -1) return controller;
				return src[pos];
			},
			getItemId: function(pos) {
				return pos;
			},
			getItemViewType: function(pos) {
				return 0;
			},
			getView: function(pos, convert, parent) {
				try {
					return views[pos] ? views[pos] : (views[pos] = vmaker(src[pos], parseInt(pos), src, params));
				} catch (e) {
					var a = new android.widget.TextView(ctx);
					a.setText(e + "\n" + e.stack);
					return a;
				}
			},
			getViewTypeCount: function() {
				return 1;
			},
			hasStableIds: function() {
				return true;
			},
			isEmpty: function() {
				return src.length === 0;
			},
			areAllItemsEnabled: function() {
				return true;
			},
			isEnabled: function(pos) {
				return pos >= 0 && pos < src.length;
			},
			registerDataSetObserver: function(p) {
				if (dso.indexOf(p) >= 0) return;
				dso.push(p);
			},
			unregisterDataSetObserver: function(p) {
				var i = dso.indexOf(p);
				if (p >= 0) dso.splice(i, 1);
			}
		});
	}
	r.Controller = function(src, views, dso, vmaker, params, preload) {
		this.src = src;
		this.views = views;
		this.dso = dso;
		this.vmaker = vmaker;
		this.params = params;
		this.preload = preload;
	}
	r.Controller.prototype = {
		notifyChange: function() {
			this.dso.forEach(function(e) {
				if (e) e.onChanged();
			});
		},
		notifyInvalidate: function() {
			this.dso.forEach(function(e) {
				if (e) e.onInvalidated();
			});
		},
		add: function(e, isInv) {
			this.src.push(e);
			if (this.preload) this.views.push(this.vmaker(e, this.src.length - 1, this.src, this.params));
			if (isInv) this.notifyChange();
		},
		concat: function(arr) {
			arr.forEach(function(e) {
				this.src.push(e)
				if (this.preload) this.views.push(this.vmaker(e, this.src.length - 1, this.src, this.params));
			}, this);
			this.notifyChange();
		},
		filter: function(f, thisArg) {
			var i;
			for (i = 0; i < this.src.length; i++) {
				if (!f.call(thisArg, this.src[i], i, this.src)) {
					this.src.splice(i, 1);
					this.views.splice(i, 1);
					i--;
				}
			}
			this.notifyChange();
		},
		forEach: function(f, thisArg) {
			var i;
			for (i in this.src) {
				if (f.call(thisArg, this.src[i], i, this.src)) {
					this.views[i] = this.vmaker(this.src[i], i, this.src, this.params);
				}
			}
			this.notifyChange();
		},
		get: function(i) {
			if (typeof(i) == "number") {
				return this.src[i];
			} else {
				return this.src;
			}
		},
		insert: function(e, i, respawn) {
			this.src.splice(i, 0, e);
			if (respawn) {
				this.respawnAll();
			} else {
				this.views.splice(i, 0, this.preload ? this.vmaker(e, i, this.src, this.params) : null);
			}
			this.notifyChange();
		},
		getCount: function() {
			return this.src.length;
		},
		remove: function(e, respawn) {
			var i;
			for (i = this.src.length; i >= 0; i--) {
				if (this.src[i] != e) continue;
				this.src.splice(i, 1);
				this.views.splice(i, 1);
			}
			if (respawn) this.respawnAll();
			this.notifyChange();
		},
		removeByIndex: function(i, respawn) {
			this.src.splice(i, 1);
			this.views.splice(i, 1);
			if (respawn) this.respawnAll();
			this.notifyChange();
		},
		removeAll: function(respawn) {
			this.src.length = 0;
			this.views.length = 0;
			if (respawn) this.respawnAll();
		},
		replace: function(e, i) {
			this.src[i] = e;
			this.views[i] = this.preload ? this.vmaker(e, i, this.src, this.params) : null;
			this.notifyChange();
		},
		respawn: function(i) {
			this.views[i] = this.vmaker(this.src[i], i, this.src, this.params);
			this.notifyChange();
		},
		respawnAll: function(i) {
			this.src.forEach(function(e, i, a) {
				this.views[i] = this.vmaker(e, i, a, this.params);
			}, this);
			this.notifyChange();
		},
		slice: function(start, end) {
			return Array.prototype.slice.apply(this.src, arguments);
		},
		splice: function(index, len) {
			var i, z = [];
			for (i in arguments) z.push(arguments[i]);
			var r = Array.prototype.splice.apply(this.src, z);
			for (i = 2; i < z.length; i++) {
				z[i] = this.preload ? this.vmaker(z[i], i - 2 + index, this.src, this.params) : null;
			}
			Array.prototype.splice.apply(this.views, z);
			this.notifyChange();
		},
		getArray: function() {
			return this.src.slice();
		},
		setArray: function(a) {
			this.views.length = this.src.length = 0;
			for (var i in a) this.src.push(a[i]);
			this.views.length = this.src.length;
			if (this.preload) {
				this.respawnAll();
			} else {
				this.notifyChange();
			}
		},
	}
	r.getController = function(adapter) {
		var r = adapter.getItem(-1);
		r.self = adapter;
		return r;
	}
	return r;
}());

gui = {
	
	//run in ui thread
	run: function(obj) {
		ctx.runOnUiThread(new java.lang.Runnable({run:obj}));
	},
	
	winMgr: ctx.getSystemService(android.content.Context.WINDOW_SERVICE),
	
	config: {
		colors: {
			dark: {
				background: android.graphics.Color.parseColor("#212121"),
				text: android.graphics.Color.parseColor("#FFFFFF"),
				sec_text: android.graphics.Color.parseColor("#7B7B7B"),
			}, 
			light: {
				background: android.graphics.Color.parseColor("#F0F0F0"),
				text: android.graphics.Color.parseColor("#000000"),
				sec_text: android.graphics.Color.parseColor("#7B7B7B"),
			}, 
		},
	},
	
	utils: {
		value_animation: function self(type, start, end, duration, interpolator, onUpdate) {
			self.anim = android.animation.ValueAnimator["of" + type](start, end);
			self.anim.setDuration(duration);
			self.anim.setInterpolator(interpolator);
			self.anim.addUpdateListener(new android.animation.ValueAnimator.AnimatorUpdateListener({
				onAnimationUpdate: onUpdate
			}));
			self.anim.start();
		},
		ripple_drawable: function(width, height, customshape) {
			var rs = null;
			switch(customshape) {
				case "oval": rs = new android.graphics.drawable.shapes.OvalShape(); break;
				case "rect": rs = new android.graphics.drawable.shapes.RectShape(); break;
				case "roundrect": rs = new android.graphics.drawable.shapes.RoundRectShape(
					[arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3], arguments[3]], 
					new android.graphics.RectF(0, 0, width, height), 
					null
				); break;
				default: rs = new android.graphics.drawable.shapes.OvalShape(); break;
			}
			rs.draw(new android.graphics.Canvas(), new android.graphics.Paint());
			var mask = new android.graphics.drawable.ShapeDrawable(rs);
			var gradientDrawable = new android.graphics.drawable.GradientDrawable();
			gradientDrawable.setColor(android.graphics.Color.TRANSPARENT);
			if (customshape == "roundrect") gradientDrawable.setCornerRadius(arguments[3]);
			gradientDrawable.setStroke(dp * 10, android.graphics.Color.TRANSPARENT);
			return new android.graphics.drawable.RippleDrawable(android.content.res.ColorStateList.valueOf(android.graphics.Color.argb(1, 0, 0, 0)), gradientDrawable, mask);
		}
	},
	
	dialogs: {
		showDialog: function(layout, width, height, onDismiss, canExit) {
			var frame, trans, params;
			frame = new android.widget.FrameLayout(ctx);
			frame.setBackgroundColor(android.graphics.Color.argb(0x80, 0, 0, 0));
			frame.setOnTouchListener(new android.view.View.OnTouchListener({
				onTouch: function touch(v, e) {
					try {
						if (e.getAction() == e.ACTION_DOWN && canExit) {
							frame.setEnabled(false);
							frame.setClickable(false);
							gui.utils.value_animation("Float", 1.0, 0, 75, new android.view.animation.DecelerateInterpolator(), function(anim) {
								frame.setAlpha(anim.getAnimatedValue());
								if(anim.getAnimatedValue() == 0) {
									if(onDismiss != null) onDismiss(frame);
									gui.winMgr.removeView(frame);
								}
							});
						}
						return false;
					} catch (e) {
						error(e);
						return false;
					}
				}
			}));
			layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(width, height, android.view.Gravity.CENTER));
			layout.getLayoutParams().setMargins(20 * dp, 20 * dp, 20 * dp, 20 * dp);
			frame.addView(layout);
			gui.utils.value_animation("Float", 0, 1, 75, new android.view.animation.DecelerateInterpolator(), function(anim) {
				frame.setAlpha(anim.getAnimatedValue());
			});
			layout.setElevation(16 * dp);
			params = new android.view.WindowManager.LayoutParams();
			params.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
			if(!canExit) params.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
			params.format = android.graphics.PixelFormat.TRANSLUCENT;
			params.width = -1;
			params.height = -1;
			gui.winMgr.addView(frame, params);
			return frame;
		},
		showProgressDialog: function self(f, isNoText, canExit) {
			self.init = function(o) {
				gui.run(function() {
					try {
						var layout = o.layout = new android.widget.LinearLayout(ctx);
						layout.setOrientation(android.widget.LinearLayout.VERTICAL);
						layout.setPadding(dp * 10, isNoText ? dp * 5 : dp * 10, dp * 10, isNoText ? dp * 5 : 0);
						layout.setBackgroundColor(gui.config.colors[config.values.theme].background);
						if (!isNoText) {
							var text = o.text = new android.widget.TextView(ctx);
							text.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
							text.setTextColor(gui.config.colors[config.values.theme].text);
							text.setPadding(dp * 10, dp * 10, dp * 10, dp * 10);
							layout.addView(text);
						}
						var progress = o.progress = android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
						layout.addView(progress);
						o.popup = gui.dialogs.showDialog(layout, -2, -2, null, canExit);
					} catch (e) {
						error(e + " → " + e.lineNumber);
					}
				})
			}, self.controller = {
				setText: function(s) {
					if (isNoText) return;
					var o = this;
					gui.run(function() {
						try {
							o.text.setText(s);
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				},
				setIndeterminate: function(b) {
					var o = this;
					gui.run(function() {
						try {
							o.progress.setIndeterminate(b);
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				},
				setMax: function(max) {
					var o = this;
					gui.run(function() {
						try {
							o.progress.setMax(max);
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				},
				setProgress: function(prog) {
					var o = this;
					gui.run(function() {
						try {
							if (!o.progress.isIndeterminate()) {
								o.progress.setProgress(prog, true);
							}
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				},
				close: function() {
					var o = this;
					gui.run(function() {
						try {
							gui.utils.value_animation("Float", 1, 0, 75, new android.view.animation.DecelerateInterpolator(), function(anim) {
								o.popup.setAlpha(anim.getAnimatedValue());
								if(anim.getAnimatedValue() == 1) gui.winMgr.removeView(o.popup);
							});
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				},
				async: function(f) {
					var o = this;
					var t = threads.start(function() {
						try {
							f(o);
						} catch (e) {
							error(e + " → " + e.lineNumber);
						}
					});
				}
			};
			var o = Object.create(self.controller);
			self.init(o);
			if (f) o.async(f);
			return o;
		},
		showConfirmDialog: function(s) {
			gui.run(function() {
				try {
					var scr, layout, title, text, skip, onClick, dialog;
					scr = new android.widget.ScrollView(ctx);
					scr.setBackgroundColor(gui.config.colors[config.values.theme].background);
					layout = new android.widget.LinearLayout(ctx);
					layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
					layout.setOrientation(android.widget.LinearLayout.VERTICAL);
					layout.setPadding(15 * dp, 15 * dp, 15 * dp, 5 * dp);
					if (s.title) {
						title = new android.widget.TextView(ctx);
						title.setText(s.title);
						title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						title.setPadding(0, 0, 0, 10 * dp);
						title.setTextColor(gui.config.colors[config.values.theme].text);
						title.setTextSize(16);
						layout.addView(title);
					}
					if (s.text) {
						text = new android.widget.TextView(ctx);
						text.setText(s.text);
						text.setPadding(0, 0, 0, 10 * dp);
						text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
						text.setTextColor(gui.config.colors[config.values.theme].sec_text);
						text.setTextSize(14);
						layout.addView(text);
					}
					if (s.skip) {
						skip = new android.widget.CheckBox(ctx);
						//skip.setChecked(Boolean(s.canSkip));
						skip.setLayoutParams(android.widget.LinearLayout.LayoutParams(-2, -2, 0));
						skip.getLayoutParams().setMargins(0, 0, 0, 10 * dp)
						skip.setText("Não mostrar novamente");
						skip.setTextColor(gui.config.colors[config.values.theme].sec_text)
						layout.addView(skip);
					}
					onClick = function(i) {
						if (s.skip) s.skip(skip.isChecked());
						if (s.callback && s.callback(i)) return;
					}
					var closed = false;
					s.buttons.map(function(e, i) {
						var b = android.widget.TextView(ctx);
						b.setId(i);
						b.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
						b.setText(String(e));
						b.setGravity(android.view.Gravity.CENTER);
						b.setPadding(10 * dp, 10 * dp, 10 * dp, 10 * dp);
						b.setTextColor(gui.config.colors[config.values.theme].text);
						b.setTextSize(14);
						b.measure(0, 0);
						b.setBackgroundDrawable(gui.utils.ripple_drawable(b.getMeasuredWidth(), b.getMeasuredHeight(), "rect"));
						b.setOnClickListener(new android.view.View.OnClickListener({
							onClick: function f(v) {
								try {if(closed != true) {
									onClick(v.getId());
									closed = true;
									gui.winMgr.removeView(dialog);
									return true;
								}} catch (e) {
									error(e + " → " + e.lineNumber);
								}
							}
						}));
						layout.addView(b);
						return b;
					});
					scr.addView(layout);
					dialog = gui.dialogs.showDialog(scr, -2, -2, null, (s.canExit != true ? false : true));
				} catch (e) {
					error(e + " → " + e.lineNumber);
				}
			})
		},
		showOperateDialog: function self(s, callback, canExit) {
			gui.run(function() {
				try {
					var frame, list, dialog;
					if (!self.adapter) {
						self.adapter = function(e) {
							e.view = new android.widget.LinearLayout(ctx);
							e.view.setOrientation(android.widget.LinearLayout.VERTICAL);
							e.view.setPadding(15 * dp, 15 * dp, 15 * dp, 15 * dp);
							e.view.setLayoutParams(new android.widget.AbsListView.LayoutParams(-1, -2));
							e._title = new android.widget.TextView(ctx);
							e._title.setText(e.text);
							e._title.setGravity(android.view.Gravity.CENTER | android.view.Gravity.LEFT);
							e._title.setFocusable(false);
							e._title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
							e._title.setTextSize(16);
							e._title.setTextColor(gui.config.colors[config.values.theme].text);
							e.view.addView(e._title);
							if (e.description) {
								e._description = new android.widget.TextView(ctx);
								e._description.setText(e.description);
								e._description.setPadding(0, 3 * dp, 0, 0);
								e._description.setLayoutParams(android.widget.LinearLayout.LayoutParams(-1, -2));
								e._description.setTextSize(14);
								e._description.setTextColor(gui.config.colors[config.values.theme].sec_text);
								e.view.addView(e._description);
							}
							return e.view;
						}
					}
					frame = new android.widget.FrameLayout(ctx);
					frame.setPadding(5 * dp, 5 * dp, 5 * dp, 5 * dp);
					frame.setBackgroundColor(gui.config.colors[config.values.theme].background);
					list = new android.widget.ListView(ctx);
					list.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-1, -2));
					list.setDividerHeight(0);
					list.setAdapter(new RhinoListAdapter(s, self.adapter));
					list.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
						onItemClick: function(parent, view, pos, id) {
							try {
								if (callback) {
									callback(pos);
									gui.utils.value_animation("Float", 1, 0, 75, new android.view.animation.DecelerateInterpolator(), function(anim) {
									dialog.setAlpha(anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 1) gui.winMgr.removeView(dialog);
								});
								}
								return true;
							} catch (e) {
								error(e + " → " + e.lineNumber);
							}
						}
					}));
					frame.addView(list);
					dialog = gui.dialogs.showDialog(frame, -1, -2, null, (canExit != true ? (typeof(canExit) != "boolean" ? true : false) : true));
				} catch (e) {
					error(e + " → " + e.lineNumber);
				}
			})
		},
	},

	
	vmaker: {},

	addViewMaker: function(name, vmaker) {
		if(!this.vmaker[name]) {
			this.vmaker[name] = vmaker;
		} else {
			error("ViewMaker " + name + " already exists.");
		}
	},

	getViewMaker: function(name) {
		if(this.vmaker[name]) {
			return this.vmaker[name];
		} else {
			error("ViewMaker " + name + " doesn't exist.");
		}
	},
	
	
	main: {

		//window 
		window_width: 325,
		window_height: 275,
		status_bar_height: 32, 
		navigation_bar_height : 50,
		navigation_bar_updown_margin: 2.5,
		
		//_global_main_popup: null,
		_global_base: null,
		_global_content_container: null, 
		_global_content: null,
		_global_title: null,
		_global_navigation_bar: null,
		_global_close: null,
		_global_statusbar: null,
		_glonal_func: [],
		
		isShowing: false,
		current_navigation_selection: NaN,
		func_showing: false,
		current: 0,
		currentPageChangeListener: null,
		
		cx: dp * 10,
		cy: dp * 10,
		
		views: [],
		
		addPage: function(j) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == j.index) {
					throw new Error("Index " + j.index + " is already exists, title is " + gui.main.views[i].title);
					return;
				} else if (j.index > 3){
					throw new Error("Page num should be lower than 4.");
					return;
				}
			}
			if(j instanceof Object) {
				j.func_clickable = true;
				gui.main.views.push(j);
			}
		},
		
		getPage: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					return gui.main.views[i];
				}
			}
		},
		
		removePage: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					gui.main.views.splice(i, 1);
				}
			}
		},
		
		show: function(index) {
			var valid = false;
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					gui.main.__internal_show(gui.main.views[i]);
					valid = true;
				}
			}
			if(valid == false) {
				throw new Error("Index " + index + " referenced a invalid view.");
				return;
			}
		},
		
		getPageInfo: function(index) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					return gui.main.views[i];
				}
			}
		},
		
		setFuncClickable: function(index, clickable) {
			for(var i in gui.main.views) {
				if(gui.main.views[i].index == index) {
					gui.main.views[i].func_clickable = clickable;
					if(gui.main.current == index && gui.main.isShowing) {
						for(var i in gui.main._glonal_func) {
							gui.main._glonal_func[i].setEnabled(clickable);
							gui.main._glonal_func[i].setClickable(clickable);
						}
					}
				}
			}
		},
		
		//metodos internos
		__internal_show: function s(content) { gui.run(function(){
			s.index = gui.main.current = content.index;
			s.initial = false;
			if(!gui.main.isShowing) { //crie uma nova janela e mostre a visualização do conteúdo
				gui.main._global_base = new android.widget.LinearLayout(ctx);
				gui.main._global_base.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_base.setOrientation(android.widget.LinearLayout.VERTICAL);
				gui.main._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * gui.main.window_width, dp * gui.main.window_height));
				gui.main._global_base.setBackgroundColor(gui.config.colors[config.values.theme].background);
				
				gui.main._global_statusbar = new android.widget.RelativeLayout(ctx);
				gui.main._global_statusbar.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * gui.main.status_bar_height));
				gui.main._global_statusbar.setBackgroundColor(gui.config.colors[config.values.theme].background);
				gui.main._global_statusbar.setElevation(10 * dp);
				
				gui.main._global_title = new android.widget.TextView(ctx);
				gui.main._global_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				gui.main._global_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -1));
				gui.main._global_title.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.main._global_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				if(content.title != null) gui.main._global_title.setText(content.title);
				gui.main._global_title.setTextSize(15);
				gui.main._global_title.setShadowLayer(dp * 5, 0, 0, android.graphics.Color.BLACK);
				gui.main._global_title.setTextColor(gui.config.colors[config.values.theme].text);
				gui.main._global_title.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.main._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.main.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.main.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.main._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							default: 
							return false;
						}
						return true;
					},
				}));
				gui.main._global_statusbar.addView(gui.main._global_title);
				
				gui.main._global_close = new android.widget.TextView(ctx);
				gui.main._global_close.setId(23);
				gui.main._global_close.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_close.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * gui.main.status_bar_height, dp * gui.main.status_bar_height));
				gui.main._global_close.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				gui.main._global_close.measure(0, 0);
				gui.main._global_close.setBackgroundDrawable(gui.utils.ripple_drawable(gui.main._global_close.getMeasuredWidth(), gui.main._global_close.getMeasuredHeight(), "rect"));
				gui.main._global_close.setText("×");
				gui.main._global_close.setTextSize(22);
				gui.main._global_close.setTextColor(gui.config.colors[config.values.theme].text);
				gui.main._global_close.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						gui.main.__internal_dismiss();
						gui.suspension.show();
					}
				}));

				gui.main._global_statusbar.addView(gui.main._global_close);
				
				gui.main._global_base.addView(gui.main._global_statusbar);
				
				gui.main._global_content_container = new android.widget.RelativeLayout(ctx);
				gui.main._global_content_container.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height)));
				gui.main._global_content_container.setBackgroundColor(gui.config.colors[config.values.theme].background);
				
				s._content_height = dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height);
				gui.main._global_content_container.measure(0, 0);
				s._content_width = gui.main._global_content_container.getMeasuredWidth();
				
				s["contentViewLayout" + s.index] = new android.widget.LinearLayout(ctx);
				s["contentViewLayout" + s.index].setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
				s["contentViewLayout" + s.index].setId(s.index);
				
				if(content.view != null) {
					s.initial = true;
					var v = content.view(s);
					v.setId(15);
					s["contentViewLayout" + s.index].addView(v);
				}
				gui.main._global_content_container.addView(s["contentViewLayout" + s.index]);
				
				gui.main._global_base.addView(gui.main._global_content_container);
				
				gui.main._global_navigation_bar = new android.widget.LinearLayout(ctx);
				gui.main._global_navigation_bar.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.main._global_navigation_bar.setOrientation(android.widget.LinearLayout.HORIZONTAL);
				gui.main._global_navigation_bar.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, dp * (gui.main.navigation_bar_height + gui.main.navigation_bar_updown_margin * 2)));
				gui.main._global_navigation_bar.setBackgroundColor(gui.config.colors[config.values.theme].background);
				
				gui.main.__internal_genNavigationList(s, content);
				
				gui.main._global_base.addView(gui.main._global_navigation_bar);
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				s._winParams.softInputMode = android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_VISIBLE;
				s._winParams.width = gui.main.window_width * dp;
				s._winParams.height = (gui.main.window_height + gui.main.navigation_bar_updown_margin * 2) * dp;
				s._winParams.x = s.x = gui.main.cx;
				s._winParams.y = s.y = gui.main.cy;
				gui.winMgr.addView(gui.main._global_base, s._winParams);
				
				gui.main.isShowing = true;
				
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_base.setAlpha(anim.getAnimatedValue());
					if(gui.main.views[s.index].update != null && anim.getAnimatedValue() == 1.0) gui.main.views[s.index].update(s);
				});
				gui.utils.value_animation("Float", 0, 1.0, 400 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_content_container.setAlpha(anim.getAnimatedValue());
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				
				if(s._anim != null) s._anim();
				if(!config.values.skipOpenWindowTip) {
					toast("Arraste o texto do cabeçalho na barra acima para mover a posição da janela flutuante.");
					config.values.skipOpenWindowTip = config.save("skip_open_window_tip", true);
				}
			} else { //a janela está sendo exibida, alterar a visualização do conteúdo
				if(gui.main.current_navigation_selection == s.index) return;
				if(content.title != null) gui.main._global_title.setText(content.title);
				
				if(!/^android/.test(String(gui.main._global_content_container.findViewById(s.index)))) {
					s["contentViewLayout" + s.index] = new android.widget.LinearLayout(ctx);
					s["contentViewLayout" + s.index].setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * (gui.main.window_height - gui.main.status_bar_height - gui.main.navigation_bar_height)));
					s["contentViewLayout" + s.index].setId(s.index);
					if(content.view != null) {
						s.initial = true;
						var v = content.view(s);
						v.setId(15);
						s["contentViewLayout" + s.index].addView(v);
						gui.main._global_content_container.addView(s["contentViewLayout" + s.index]);
					}
				}
				var cid = gui.main.current_navigation_selection;
				var tid = s.index;
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_content_container.findViewById(cid).findViewById(15).setAlpha(1.0 - anim.getAnimatedValue());
					gui.main._global_content_container.findViewById(tid).findViewById(15).setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 1.0) {
						var previousContainer = gui.main._global_content_container.findViewById(cid);
						previousContainer.findViewById(15).setEnabled(false);
						previousContainer.findViewById(15).setClickable(false);
						previousContainer.setEnabled(false);
						previousContainer.setClickable(false);
						previousContainer.setZ(0);
						var targetContainer = gui.main._global_content_container.findViewById(tid);
						targetContainer.findViewById(15).setEnabled(true);
						targetContainer.findViewById(15).setClickable(true);
						targetContainer.setEnabled(true);
						targetContainer.setClickable(true);
						targetContainer.setZ(1);
						if(gui.main.views[tid].update != null && anim.getAnimatedValue() == 1.0) gui.main.views[tid].update(s);
					}
				});
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				
				gui.main.currentPageChangeListener = content.onPageChanged;
				gui.main.__internal_changeNavigationStatus(s, content);
			}

			if(gui.main.views[s.index].func == null || !gui.main.views[s.index].func.length) {
				if(gui.main.func_showing) {
					//nenhuma função extra e a página anterior tem função
					gui.main.func_showing = false;
					gui.utils.value_animation("Float", 0, 1, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
						for(var i in gui.main._glonal_func) {
							gui.main._glonal_func[i].setAlpha(1 - anim.getAnimatedValue());
							if(anim.getAnimatedValue() == 1.0) {
								gui.main._global_statusbar.removeView(gui.main._glonal_func[i]);
							}
						}
					});
				}
			} else {
				for(var i in gui.main._glonal_func) gui.main._global_statusbar.removeView(gui.main._glonal_func[i]);
				gui.main.func_showing = true;
				s.baseFuncIndex = gui.main._global_close.getId();
				for(var i in content.func) {
					var view = new android.widget.ImageView(ctx);
					view.setId(++s.baseFuncIndex);
					view.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * gui.main.status_bar_height, dp * gui.main.status_bar_height));
					view.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, s.baseFuncIndex - 1);
					view.measure(0, 0);
					view.setBackgroundDrawable(gui.utils.ripple_drawable(view.getMeasuredWidth(), view.getMeasuredHeight(), "rect"));
					view.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
					view.setAlpha(0);
					view.setImageBitmap(config.bitmaps[content.func[i].icon]);
					view.setOnClickListener(new android.view.View.OnClickListener({
						onClick: function(view) {content.func[view.getId() - (gui.main._global_close.getId() + 1)].onClick(s, content)}
					}));
					gui.main._global_statusbar.addView(view);
					gui.main._glonal_func.push(view);
				}
				gui.utils.value_animation("Float", 0, 1, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					for(var i in gui.main._glonal_func) {
						gui.main._glonal_func[i].setAlpha(anim.getAnimatedValue());
					}
				});
			}
			gui.main.current_navigation_selection = s.index;
		})},
		__internal_genNavigationList: function(s, content) { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			s.__2x_navigation_padding = (gui.main.window_width - gui.main.views.length * gui.main.navigation_bar_height) / (gui.main.views.length);
			for(var i in gui.main.views) {
				s["navigationBtn" + i] = new android.widget.LinearLayout(ctx);
				s["navigationBtn" + i].setId(i);
				s["navigationBtn" + i].setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				s["navigationBtn" + i].setOrientation(android.widget.LinearLayout.VERTICAL);
				s["navigationBtn" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * gui.main.navigation_bar_height, dp * gui.main.navigation_bar_height));
				s["navigationBtn" + i].setBackgroundDrawable(gui.utils.ripple_drawable(0, 0, "roundrect", dp * 2));
				switch (i) {
					case 0: s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin); break;
					case (gui.main.views.length - 1): s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding, dp * gui.main.navigation_bar_updown_margin); break;
					default: s["navigationBtn" + i].getLayoutParams().setMargins(s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin, s.__2x_navigation_padding / 2, dp * gui.main.navigation_bar_updown_margin); break;
				}
				s["navigationBtn" + i].setOnClickListener(new android.view.View.OnClickListener({
					onClick: function(view) { if(gui.main.current_navigation_selection != Number(view.getId())) {
						if(typeof(gui.main.currentPageChangeListener) == "function") gui.main.currentPageChangeListener(s, content);
						gui.main.__internal_show(gui.main.views[Number(view.getId())]);
						gui.main.current_navigation_selection = Number(view.getId());
					}}
				}));
				
				s["navigationBtnText" + i] = new android.widget.TextView(ctx);
				s["navigationBtnText" + i].setId(12);
				s["navigationBtnText" + i].setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				s["navigationBtnText" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				s["navigationBtnText" + i].setText(gui.main.views[i].navigation_title);
				s["navigationBtnText" + i].setTextSize(12);
				s["navigationBtnText" + i].setShadowLayer(dp, 0, 0, android.graphics.Color.BLACK);
				s["navigationBtnText" + i].setTextColor(s.index == gui.main.views[i].index ? gui.config.colors[config.values.theme].text : gui.config.colors[config.values.theme].sec_text);
				
				s["navigationBtnImg" + i] = new android.widget.ImageView(ctx);
				s["navigationBtnImg" + i].setId(14);
				s["navigationBtnImg" + i].setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				if(gui.main.views[i].navigation_icon != null) s["navigationBtnImg" + i].setImageBitmap(config.bitmaps[gui.main.views[i].navigation_icon]);
				s.__navigationBtnImgHeight = (function() {
					s["navigationBtnText" + i].measure(0, 0);
					return dp * gui.main.navigation_bar_height - s["navigationBtnText" + i].getMeasuredHeight();
				}());
				s["navigationBtnImg" + i].setLayoutParams(new android.widget.LinearLayout.LayoutParams(s.__navigationBtnImgHeight, s.__navigationBtnImgHeight));
				
				s["navigationBtn" + i].addView(s["navigationBtnImg" + i]);
				s["navigationBtn" + i].addView(s["navigationBtnText" + i]);
				gui.main._global_navigation_bar.addView(s["navigationBtn" + i]);
			}
		})},
		__internal_changeNavigationStatus: function(s, content) { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			if(!/^android/.test(String(gui.main._global_navigation_bar.findViewById(s.index)))) return;
			if(gui.main.current_navigation_selection == s.index) return;
			var colorAnim = android.animation.ObjectAnimator.ofInt(gui.main._global_navigation_bar.findViewById(s.index).findViewById(12), "textColor", gui.config.colors[config.values.theme].sec_text, gui.config.colors[config.values.theme].text);
			colorAnim.setDuration(300);
			colorAnim.setEvaluator(new android.animation.ArgbEvaluator());
			colorAnim.start();
			colorAnim = android.animation.ObjectAnimator.ofInt(gui.main._global_navigation_bar.findViewById(gui.main.current_navigation_selection).findViewById(12), "textColor", gui.config.colors[config.values.theme].text, gui.config.colors[config.values.theme].sec_text);
			colorAnim.setDuration(300);
			colorAnim.setEvaluator(new android.animation.ArgbEvaluator());
			colorAnim.start();

			for(var i in gui.main.views) {
				s["navigationBtn" + i].setOnClickListener(new android.view.View.OnClickListener({
					onClick: function(view) { if(gui.main.current_navigation_selection != Number(view.getId())) {
						if(typeof(gui.main.currentPageChangeListener) == "function") gui.main.currentPageChangeListener(s, content);
						gui.main.__internal_show(gui.main.views[Number(view.getId())]);
						gui.main.current_navigation_selection = Number(view.getId());
					}}
				}));
			}

			gui.main.current_navigation_selection = s.index;
			
		})},
		__internal_rmNavigationList: function() { gui.run(function(){
			if(gui.main._global_navigation_bar == null) return;
			for(var i = 0; i < gui.main.views.length; i++) {
				gui.main._global_navigation_bar.removeView(gui.main._global_navigation_bar.findViewById(i));
			}
		})},
		__internal_dismiss: function() { gui.run(function(){
			if (gui.main.isShowing) {
				gui.main.isShowing = false;
				gui.main._global_close.setEnabled(false);
				gui.main._global_close.setClickable(false);
				gui.utils.value_animation("Float", 1.0, 0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.main._global_base);
					}
				});
			}
		})},
	},
	
	suspension: {
		
		_global_base: null,
		
		isShowing: false,
		
		cx: 0,
		cy: 0,
		
		width: dp * 35,
		height: dp * 35,
		
		show: function s() { gui.run(function(){
			if(!gui.suspension.isShowing) {
				gui.suspension._global_base = new android.widget.TextView(ctx);
				gui.suspension._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(gui.suspension.width, gui.suspension.height));
				gui.suspension._global_base.setText("\u27e1");
				gui.suspension._global_base.setTextColor(android.graphics.Color.parseColor("#FFFFD1"));
				gui.suspension._global_base.setShadowLayer(dp * 3, 0, 0, android.graphics.Color.parseColor("#390c1a"));
				gui.suspension._global_base.setTextSize(30);
				gui.suspension._global_base.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.suspension._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.suspension.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.suspension.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.suspension._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
						}
						return false;
					},
				}));
				gui.suspension._global_base.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						gui.suspension._global_base.setEnabled(false);
						gui.suspension._global_base.setClickable(false);
						gui.suspension.dismiss();
						gui.main.show(gui.main.current);
					}
				}));
				gui.suspension._global_base.setEnabled(true);
				gui.suspension._global_base.setClickable(true);
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				s._winParams.width = gui.suspension.width;
				s._winParams.height = gui.suspension.height;
				s._winParams.x = s.x = gui.suspension.cx;
				s._winParams.y = s.y = gui.suspension.cy;
				gui.winMgr.addView(gui.suspension._global_base, s._winParams);
				
				gui.suspension.isShowing = true;
			}
		})},
		dismiss: function() { gui.run(function(){
			if (gui.suspension.isShowing) {
				gui.suspension.isShowing = false;
				gui.utils.value_animation("Float", 1.0, 0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.suspension._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.suspension._global_base);
					}
				});
			}
		})},
	},
	
	key_coordinate_navigation: {
		
		_global_base: null,
		_global_text: null,
		
		isShowing: false,
		isShowingText: false,
		
		cx: dp * 10,
		cy: dp * 10,
		
		total: 15,
		
		current_index: 0,
		
		__internal_showTargetDots: function s(keyTargetedCbk, finishCbk) { gui.run(function(){
			if(!gui.key_coordinate_navigation.isShowing) {
				gui.key_coordinate_navigation._global_base = new android.widget.TextView(ctx);
				gui.key_coordinate_navigation._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.key_coordinate_navigation._global_base.setTextColor(android.graphics.Color.GREEN);
				gui.key_coordinate_navigation._global_base.setText("\u26d2");
				gui.key_coordinate_navigation._global_base.setTextSize(25);
				gui.key_coordinate_navigation._global_base.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.key_coordinate_navigation._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.key_coordinate_navigation.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.key_coordinate_navigation.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.key_coordinate_navigation._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							case event.ACTION_UP: 
								gui.key_coordinate_navigation._global_text.setText("Tecla " + (gui.key_coordinate_navigation.current_index + 1) + "] as coordenadas foram definidas em: [" + event.getRawX() + ", " + event.getRawY() + "]");
								keyTargetedCbk([event.getRawX(), event.getRawY()]);
								gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.key_coordinate_navigation._global_base.setAlpha(anim.getAnimatedValue());
									gui.key_coordinate_navigation._global_text.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 0) {
										gui.key_coordinate_navigation.__internal_dismissTargetDot();
										gui.key_coordinate_navigation.isShowing = false;
									}
								});
								var handler = new android.os.Handler();
								handler.postDelayed(function() {
									if(++gui.key_coordinate_navigation.current_index < gui.key_coordinate_navigation.total) {
										gui.key_coordinate_navigation.__internal_showTargetDots(keyTargetedCbk, finishCbk);
									} else {
										finishCbk();
										gui.key_coordinate_navigation.__internal_dismissText();
										gui.main.show(2);
									}
								}, 1000);
							default: 
							return false;
						}
						return true;
					},
				}));
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.key_coordinate_navigation._global_base.measure(0, 0);
				s._winParams.width = gui.key_coordinate_navigation._global_base.getMeasuredWidth();
				s._winParams.height = gui.key_coordinate_navigation._global_base.getMeasuredHeight();
				s._winParams.x = s.x = gui.key_coordinate_navigation.cx;
				s._winParams.y = s.y = gui.key_coordinate_navigation.cy;
				gui.winMgr.addView(gui.key_coordinate_navigation._global_base, s._winParams);
				gui.utils.value_animation("Float", 0, 1, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.key_coordinate_navigation._global_base.setAlpha(anim.getAnimatedValue());
					gui.key_coordinate_navigation._global_text.setAlpha(anim.getAnimatedValue());
				});
				gui.key_coordinate_navigation._global_text.setText("Mova \"\u26d2\" para a tecla para definir a " + (gui.key_coordinate_navigation.current_index + 1) + " coordenadas de chave.");
				gui.key_coordinate_navigation.isShowing = true;
			}
		})},
		__internal_dismissTargetDot: function() { gui.run(function(){
			if (gui.key_coordinate_navigation.isShowing) {
				gui.winMgr.removeView(gui.key_coordinate_navigation._global_base);
				gui.key_coordinate_navigation.isShowing = false;
			}
		})},
		
		__internal_showTips: function s() { gui.run(function(){
			if(!gui.key_coordinate_navigation.isShowingText) {
				gui.key_coordinate_navigation._global_text = new android.widget.TextView(ctx);
				gui.key_coordinate_navigation._global_text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.key_coordinate_navigation._global_text.setTextColor(gui.config.colors[config.values.theme].text);
				gui.key_coordinate_navigation._global_text.setBackgroundColor(gui.config.colors[config.values.theme].background);
				gui.key_coordinate_navigation._global_text.setTextSize(16);
				gui.key_coordinate_navigation._global_text.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.key_coordinate_navigation._global_text.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.key_coordinate_navigation._global_text.measure(0, 0);
				s._winParams.width = context.getResources().getDisplayMetrics().widthPixels - dp * 10;
				s._winParams.height = gui.key_coordinate_navigation._global_text.getMeasuredHeight();
				
				gui.winMgr.addView(gui.key_coordinate_navigation._global_text, s._winParams);
				
				s.lp = gui.key_coordinate_navigation._global_text.getLayoutParams();
				s.lp.y = context.getResources().getDisplayMetrics().heightPixels / 2 - gui.key_coordinate_navigation._global_text.getMeasuredHeight() - dp * 5;
				gui.winMgr.updateViewLayout(gui.key_coordinate_navigation._global_text, s.lp);
				gui.key_coordinate_navigation.isShowingText = true;
			}
		})},
		__internal_dismissText: function() { gui.run(function(){
			if (gui.key_coordinate_navigation.isShowingText) {
				gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.key_coordinate_navigation._global_text.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.key_coordinate_navigation._global_text);
						gui.key_coordinate_navigation.isShowingText = false;
					}
				});
			}
		})},
		
		show: function(keyCount, keyTargetedCbk, finishCbk) {
			gui.key_coordinate_navigation.current_index = 0;
			gui.key_coordinate_navigation.total = keyCount ? keyCount : 15;
			this.__internal_showTips();
			this.__internal_showTargetDots(keyTargetedCbk, finishCbk);
		},
		
	},
	
	player_panel: {
		
		_global_base: null,
		_global_text: null,
		_global_seek: null,
		
		isShowing: false,
		
		cx: null,
		cy: null,
		
		__internal_showPanel: function s(sheet) { gui.run(function(){
			if(!gui.player_panel.isShowing) {
				gui.player_panel._global_base = new android.widget.RelativeLayout(ctx);
				gui.player_panel._global_base.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
				gui.player_panel._global_base.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_base.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_base.setBackgroundColor(gui.config.colors[config.values.theme].background);
				
				gui.player_panel._global_text = new android.widget.TextView(ctx);
				gui.player_panel._global_text.setId(12);
				gui.player_panel._global_text.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				gui.player_panel._global_text.setTextColor(gui.config.colors[config.values.theme].text);
				gui.player_panel._global_text.setTextSize(14);
				gui.player_panel._global_text.setText("Análise...");
				gui.player_panel._global_text.setSingleLine(true);
				gui.player_panel._global_text.setEllipsize(android.text.TextUtils.TruncateAt.END);
				//gui.player_panel._global_text.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				gui.player_panel._global_text.getLayoutParams().setMargins(0, 0, 0, dp * 2);
				gui.player_panel._global_text.setOnTouchListener(new android.view.View.OnTouchListener({
					onTouch: function onTouchFunction(view, event) {
						switch (event.getAction()) {
							case event.ACTION_MOVE:
								onTouchFunction.lp = gui.player_panel._global_base.getLayoutParams();
								onTouchFunction.lp.x = gui.player_panel.cx = s.x = event.getRawX() + onTouchFunction.offsetX;
								onTouchFunction.lp.y = gui.player_panel.cy = s.y = event.getRawY() + onTouchFunction.offsetY;
								gui.winMgr.updateViewLayout(gui.player_panel._global_base, onTouchFunction.lp);
							break;
							case event.ACTION_DOWN:
								onTouchFunction.offsetX = s.x - event.getRawX();
								onTouchFunction.offsetY = s.y - event.getRawY();
							break;
							default: 
							return false;
						}
						return true;
					},
				}));
				gui.player_panel._global_base.addView(gui.player_panel._global_text);
				
				s.close = new android.widget.TextView(ctx);
				s.close.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
				gui.player_panel._global_text.measure(0, 0);
				s.close.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(gui.player_panel._global_text.getMeasuredHeight(), gui.player_panel._global_text.getMeasuredHeight()));
				s.close.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				s.close.measure(0, 0);
				s.close.setBackgroundDrawable(gui.utils.ripple_drawable(s.close.getMeasuredWidth(), s.close.getMeasuredHeight(), "rect"));
				s.close.setText("×");
				s.close.setTextSize(15);
				s.close.setTextColor(gui.config.colors[config.values.theme].text);
				s.close.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						if(gui.player_panel.isShowing) {
							gui.player_panel.__internal_dismiss();
							sheetplayer.stop();
							gui.main.show(0);
						}
					}
				}));
				gui.player_panel._global_base.addView(s.close);
				
				gui.player_panel._global_seek = new android.widget.SeekBar(ctx);
				gui.player_panel._global_seek.setId(13);
				gui.player_panel._global_seek.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, -2));
				gui.player_panel._global_seek.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 12);
				gui.player_panel._global_seek.getLayoutParams().setMargins(0, dp * 2, 0, dp * 2);
				gui.player_panel._global_seek.setOnSeekBarChangeListener(new android.widget.SeekBar.OnSeekBarChangeListener({
					onProgressChanged: function(sb, p) {
					},
					onStopTrackingTouch: function(sb) {
						sheetplayer.setProgress(sb.getProgress());
					},
				}));
				gui.player_panel._global_seek.setEnabled(false);
				gui.player_panel._global_seek.setClickable(false);
				gui.player_panel._global_base.addView(gui.player_panel._global_seek);
				
				s.control_panel = new android.widget.RelativeLayout(ctx);
				s.control_panel.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, -2));
				s.control_panel.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 13);
				
				gui.player_panel._global_status = new android.widget.TextView(ctx);
				gui.player_panel._global_status.setId(14);
				gui.player_panel._global_status.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 275, -2));
				gui.player_panel._global_status.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				gui.player_panel._global_status.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
				gui.player_panel._global_status.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				gui.player_panel._global_status.getLayoutParams().setMargins(0, 0, 0, dp * 1);
				gui.player_panel._global_status.setTextColor(gui.config.colors[config.values.theme].sec_text);
				gui.player_panel._global_status.setTextSize(12);
				//gui.player_panel._global_status.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				s.control_panel.addView(gui.player_panel._global_status);
				
				gui.player_panel._global_cnote = new android.widget.TextView(ctx);
				gui.player_panel._global_cnote.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 275, -2));
				gui.player_panel._global_cnote.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				gui.player_panel._global_cnote.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 14);
				gui.player_panel._global_cnote.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				gui.player_panel._global_cnote.getLayoutParams().setMargins(0, dp * 1, 0, 0);
				gui.player_panel._global_cnote.setTextColor(gui.config.colors[config.values.theme].sec_text);
				gui.player_panel._global_cnote.setTextSize(12);
				//gui.player_panel._global_cnote.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
				s.control_panel.addView(gui.player_panel._global_cnote);
				
				s.speedr = new android.widget.ImageView(ctx);
				s.speedr.setId(15);
				s.speedr.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.speedr.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 32, dp * 32));
				s.speedr.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				s.speedr.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				s.speedr.setPadding(dp * 8, dp * 8, dp * 8, dp * 8);
				s.speedr.setImageBitmap(config.bitmaps.speedup);
				s.speedr.measure(0, 0);
				s.speedr.setBackgroundDrawable(gui.utils.ripple_drawable(s.speedr.getMeasuredWidth(), s.speedr.getMeasuredHeight(), "rect"));
				s.speedr.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.speed_up();
						gui.player_panel.refreshStatus();
					}
				}));
				s.speedr.setEnabled(false);
				s.speedr.setClickable(false);
				s.control_panel.addView(s.speedr);
				
				s.pause = new android.widget.ImageView(ctx);
				s.pause.setId(16);
				s.pause.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.pause.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 32, dp * 32));
				s.pause.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 15);
				s.pause.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				s.pause.setPadding(dp * 8, dp * 8, dp * 8, dp * 8);
				s.pause.setImageBitmap(config.bitmaps.pause);
				s.pause.measure(0, 0);
				s.pause.setBackgroundDrawable(gui.utils.ripple_drawable(s.pause.getMeasuredWidth(), s.pause.getMeasuredHeight(), "rect"));
				s.pause.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.pause();
						gui.player_panel.refreshStatus();
					}
				}));
				s.pause.setEnabled(false);
				s.pause.setClickable(false);
				s.control_panel.addView(s.pause);
				
				s.play = new android.widget.ImageView(ctx);
				s.play.setId(17);
				s.play.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.play.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 32, dp * 32));
				s.play.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 16);
				s.play.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				s.play.setPadding(dp * 8, dp * 8, dp * 8, dp * 8);
				s.play.setImageBitmap(config.bitmaps.play);
				s.play.measure(0, 0);
				s.play.setBackgroundDrawable(gui.utils.ripple_drawable(s.play.getMeasuredWidth(), s.play.getMeasuredHeight(), "rect"));
				s.play.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.play(gui.player_panel.refreshStatus);
					}
				}));
				s.play.setEnabled(false);
				s.play.setClickable(false);
				s.control_panel.addView(s.play);
				
				s.speedl = new android.widget.ImageView(ctx);
				s.speedl.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				s.speedl.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 28, dp * 28));
				s.speedl.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 17);
				s.speedl.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				s.speedl.setPadding(dp * 8, dp * 8, dp * 8, dp * 8);
				s.speedl.setImageBitmap(config.bitmaps.speedup);
				s.speedl.setRotation(180);
				s.speedl.measure(0, 0);
				s.speedl.setBackgroundDrawable(gui.utils.ripple_drawable(s.speedl.getMeasuredWidth(), s.speedl.getMeasuredHeight(), "rect"));
				s.speedl.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						sheetplayer.slow_down();
						gui.player_panel.refreshStatus();
					}
				}));
				s.speedl.setEnabled(false);
				s.speedl.setClickable(false);
				s.control_panel.addView(s.speedl);
				
				gui.player_panel._global_base.addView(s.control_panel);
				
				s._winParams = new android.view.WindowManager.LayoutParams();
				s._winParams.type = android.view.WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
				s._winParams.flags = android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;
				s._winParams.format = android.graphics.PixelFormat.TRANSLUCENT;
				gui.player_panel._global_base.measure(0, 0);
				s._winParams.width = gui.player_panel._global_base.getMeasuredWidth();
				s._winParams.height = gui.player_panel._global_base.getMeasuredHeight();
				
				gui.winMgr.addView(gui.player_panel._global_base, s._winParams);
				
				s.lp = gui.player_panel._global_base.getLayoutParams();
				if(gui.player_panel.cx == null) {
					gui.player_panel.cx = 0;
					gui.player_panel.cy = context.getResources().getDisplayMetrics().heightPixels / 2 - gui.player_panel._global_base.getMeasuredHeight() - dp * 2;
				}
				s.lp.x = s.x = gui.player_panel.cx;
				s.lp.y = s.y = gui.player_panel.cy;
				
				gui.winMgr.updateViewLayout(gui.player_panel._global_base, s.lp);
				gui.player_panel.isShowing = true;
				
				gui.player_panel.refreshStatus();
				
				if(!config.values.skipOpenPlayerPanelWindowTip) {
					toast("Arraste o texto do cabeçalho na barra acima para mover a posição do player.");
					config.values.skipOpenPlayerPanelWindowTip = config.save("skip_open_player_panel_window_tip", true);
				}
				
				threads.start(function() {
					sheetplayer.setSheet(sheet);
					gui.run(function() {
						gui.player_panel._global_seek.setMax(sheetplayer.noteCount);
						gui.player_panel._global_seek.setMin(0);
						s.play.setEnabled(true);
						s.play.setClickable(true);
						s.pause.setEnabled(true);
						s.pause.setClickable(true);
						s.speedl.setEnabled(true);
						s.speedl.setClickable(true);
						s.speedr.setEnabled(true);
						s.speedr.setClickable(true);
						gui.player_panel._global_seek.setEnabled(true);
						gui.player_panel._global_seek.setClickable(true);
						
						gui.player_panel._global_text.setAlpha(0);
						gui.player_panel._global_seek.setAlpha(0);
						gui.player_panel._global_status.setAlpha(0);
						gui.player_panel._global_cnote.setAlpha(0);
						s.close.setAlpha(0);
						s.pause.setAlpha(0);
						s.speedr.setAlpha(0);
						s.play.setAlpha(0);
						s.speedl.setAlpha(0);
						
						gui.player_panel.refreshStatus();
						//Nem um pouco elegante
						var h = new android.os.Handler();
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								gui.player_panel._global_text.setAlpha(anim.getAnimatedValue());
							});
							gui.player_panel._global_text.setText(sheetplayer.name);
						}, 0);
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								gui.player_panel._global_seek.setAlpha(anim.getAnimatedValue());
								s.close.setAlpha(anim.getAnimatedValue());
							});
						}, 30);
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								gui.player_panel._global_status.setAlpha(anim.getAnimatedValue());
								s.speedl.setAlpha(anim.getAnimatedValue());
							});
						}, 60);
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								gui.player_panel._global_cnote.setAlpha(anim.getAnimatedValue());
								s.play.setAlpha(anim.getAnimatedValue());
							});
						}, 90);
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								s.pause.setAlpha(anim.getAnimatedValue());
							});
						}, 120);
						h.postDelayed(function() {
							gui.utils.value_animation("Float", 0, 1, 300 , new android.view.animation.LinearInterpolator(), function(anim) {
								s.speedr.setAlpha(anim.getAnimatedValue());
							});
						}, 150);
					});
				});
			}
		});},
		refreshStatus: function() { gui.run(function(){
			gui.player_panel._global_status.setText(String(sheetplayer.speed_list[sheetplayer.current_speed_index] + "x: " + (sheetplayer.playing ? (Number(sheetplayer.currentNote + 1) + "/" + sheetplayer.noteCount + " -> " + sheetplayer.nextInterval + "ms") : (sheetplayer.thread == null ? "Idle" : "Paused"))));
			gui.player_panel._global_cnote.setText(String(sheetplayer.playing ? (sheetplayer.notes[sheetplayer.currentNote < sheetplayer.noteCount ? sheetplayer.currentNote : sheetplayer.noteCount - 1].keys) : "-"));
			gui.player_panel._global_seek.setProgress(sheetplayer.currentNote);
			gui.utils.value_animation("Float", 0, 1, 80 , new android.view.animation.LinearInterpolator(), function(anim) {
				gui.player_panel._global_cnote.setAlpha(anim.getAnimatedValue());
				gui.player_panel._global_status.setAlpha(anim.getAnimatedValue());
			});
			
		});},
		__internal_dismiss: function() { gui.run(function(){
			if (gui.player_panel.isShowing) {
				gui.player_panel.isShowing = false;
				gui.utils.value_animation("Float", 1, 0, 200 , new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.player_panel._global_base.setAlpha(anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						gui.winMgr.removeView(gui.player_panel._global_base);
					}
				});
			}
		})},
		
		show: function() {
			this.__internal_showTips();
			this.__internal_showTargetDots();
		},
		
	},
	
};

gui.run(function(){
	ui.setContentView((function(){
		var layout = new android.widget.LinearLayout(ctx);
		layout.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -1));
		layout.setOrientation(android.widget.LinearLayout.VERTICAL);
		layout.setPadding(15 * dp, 15 * dp, 15 * dp, 15 * dp);
		layout.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
		var prompt = new android.widget.TextView(ctx);
		prompt.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
		prompt.getLayoutParams().setMargins(dp * 15, dp * 5, dp * 15, dp * 15);
		prompt.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
		prompt.setText(android.text.Html.fromHtml("SkyAutoPlayer - Script feito por @iamjunioru<br>Se interessa em comprar o script? Entre em contato:<br><b>Discord: dream#2001 - Whatsapp: (88) 9.9495-3035</b><br>Não aconteceu nada?<br>Talvez você deva ver se Auto.js tem<u><b> permissões de janela flutuante</u></b><br><br>" + (function() {
			if(app.autojs.versionCode == 461) {
				return "A versão do Auto.js é <b>4.1.1 Alpha2</b>"
			} else {
				return "<font color=red>A versão atual do Auto.js é - <b>" + app.autojs.versionName + "</b>，Bugs podem ocorrer dependendo da versão！</font><br>Recomendo usar Auto.js versão <b>4.1.1 Alpha2</b>！<br><b>4.1.1 Alpha2</b> Download da versão: <a href=https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2>https://github.com/Ericwyn/Auto.js/releases/tag/V4.1.1.Alpha2</a>"
			}
		}())));
		layout.addView(prompt);
		var btn = new android.widget.Button(ctx);
		btn.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
		btn.setText("Forçar saída");
		btn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				java.lang.System.exit(0);
			}
		}));
		layout.addView(btn);
		return layout;
	}()));
});

gui.dialogs.showProgressDialog(function(o) {
	o.setIndeterminate(true);
	o.setText("Carregando configurações...");
	config.init();
	config.checkVersion();
	o.setText("Carregando recursos...");
	config.fetchResources(function(msg) {
		if(msg instanceof Error) {
			o.close();
			error(msg);
			exit();
		} else {
			o.setText(msg);
		}
	});
	config.updateBitmapTheme();
	gui.addViewMaker("sheetInfo", function(item) {
		var scr = new android.widget.ScrollView(ctx);
		scr.setBackgroundColor(gui.config.colors[config.values.theme].background);
		var layout = new android.widget.LinearLayout(ctx);
		layout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
		layout.setOrientation(android.widget.LinearLayout.VERTICAL);
		layout.setPadding(15 * dp, 15 * dp, 15 * dp, 15 * dp);
		var title = new android.widget.TextView(ctx);
		title.setText(item.name);
		title.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
		title.setPadding(0, 0, 0, 10 * dp);
		title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		title.setTextColor(gui.config.colors[config.values.theme].text);
		title.setTextSize(20);
		title.getLayoutParams().setMargins(0, 0, 0, 7.5 * dp);
		layout.addView(title);
		var infoLayout = new android.widget.RelativeLayout(ctx);
		infoLayout.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-2, -2));
		infoLayout.setPadding(10 * dp, 10 * dp, 10 * dp, 10 * dp);
		var authorImg = new android.widget.ImageView(ctx);
		authorImg.setId(10);
		authorImg.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 38, dp * 38));
		authorImg.measure(0, 0);
		authorImg.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
		authorImg.setImageBitmap(config.bitmaps.user);
		authorImg.getLayoutParams().setMargins(0, 0, dp * 7.5, dp * 5);
		var authorText = new android.widget.TextView(ctx);
		authorText.setId(11);
		authorText.setText(android.text.Html.fromHtml((item.author.length == 0 ? "<font color=#7B7B7B>Not Provided</font>" : item.author)));
		authorText.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, dp * 38));
		authorText.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 10);
		authorText.setPadding(0, 0, 0, 0);
		authorText.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		authorText.setTextColor(gui.config.colors[config.values.theme].text);
		authorText.setTextSize(16);
		authorText.getLayoutParams().setMargins(dp * 7.5, 0, 0, dp * 5);
		var noteImg = new android.widget.ImageView(ctx);
		noteImg.setId(12);
		noteImg.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 38, dp * 38));
		noteImg.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 10);
		noteImg.measure(0, 0);
		noteImg.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
		noteImg.setImageBitmap(config.bitmaps.piano);
		noteImg.getLayoutParams().setMargins(0, dp * 5, dp * 7.5, dp * 5);
		var noteText = new android.widget.TextView(ctx);
		noteText.setId(13);
		noteText.setText((item.noteCount ? item.noteCount : item.songNotes.length) + " notes");
		noteText.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, dp * 38));
		noteText.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 12);
		noteText.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 11);
		noteText.setPadding(0, 0, 0, 0);
		noteText.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		noteText.setTextColor(gui.config.colors[config.values.theme].text);
		noteText.setTextSize(16);
		noteText.getLayoutParams().setMargins(dp * 7.5, dp * 5, 0, dp * 5);
		var pitchImg = new android.widget.ImageView(ctx);
		pitchImg.setId(14);
		pitchImg.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 38, dp * 38));
		pitchImg.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 12);
		pitchImg.measure(0, 0);
		pitchImg.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
		pitchImg.setImageBitmap(config.bitmaps.note);
		pitchImg.getLayoutParams().setMargins(0, dp * 5, dp * 7.5, dp * 5);
		var pitchText = new android.widget.TextView(ctx);
		pitchText.setId(15);
		pitchText.setText(android.text.Html.fromHtml((function(){
			var r = "<font color=";
			switch(item.pitchLevel) {
				case 0: r += "#FF6100";break;
				case 1: r += "#FF9200";break;
				case 2: r += "#FFC600";break;
				case 3: r += "#FFFF00";break;
				case 4: r += "#8CC619";break;
				case 5: r += "#00815A";break;
				case 6: r += "#0096B5";break;
				case 7: r += "#2971B5";break;
				case 8: r += "#424DA4";break;
				case 9: r += "#6B3594";break;
				case 10: r += "#C5047B";break;
				case 11: r += "#FF0000";break;
			}
			r += (">" + sheetmgr.pitch_suggestion[item.pitchLevel].name + "</font>");
			return r;
		}())));
		pitchText.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, dp * 38));
		pitchText.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 14);
		pitchText.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 13);
		pitchText.setPadding(0, 0, 0, 0);
		pitchText.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		pitchText.setTextColor(gui.config.colors[config.values.theme].text);
		pitchText.setTextSize(16);
		pitchText.getLayoutParams().setMargins(dp * 7.5, dp * 5, 0, dp * 5);
		infoLayout.addView(authorImg);
		infoLayout.addView(authorText);
		infoLayout.addView(noteImg);
		infoLayout.addView(noteText);
		infoLayout.addView(pitchImg);
		infoLayout.addView(pitchText);
		if(item.songNotes) {
			var timeImg = new android.widget.ImageView(ctx);
			timeImg.setId(16);
			timeImg.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 38, dp * 38));
			timeImg.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 14);
			timeImg.measure(0, 0);
			timeImg.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
			timeImg.setImageBitmap(config.bitmaps.clock);
			timeImg.getLayoutParams().setMargins(0, dp * 5, dp * 7.5, 0);
			var timeText = new android.widget.TextView(ctx);
			timeText.setId(17);
			timeText.setText((function(){
				var time_ms = item.songNotes[item.songNotes.length - 1].time;
				var second_s = Math.floor(time_ms / 1000);
				
				var millis = time_ms - second_s * 1000;
				var minute = Math.floor(second_s / 60);
				var second = second_s - minute * 60;
				
				return minute + ":" + second + "." + millis;
			}()));
			timeText.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, dp * 38));
			timeText.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 16);
			timeText.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 15);
			timeText.setPadding(0, 0, 0, 0);
			timeText.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
			timeText.setTextColor(gui.config.colors[config.values.theme].text);
			timeText.setTextSize(16);
			timeText.getLayoutParams().setMargins(dp * 7.5, dp * 5, 0, 0);
			infoLayout.addView(timeImg);
			infoLayout.addView(timeText);
		}
		infoLayout.measure(0, 0);
		layout.addView(infoLayout);

		var sugPrompt = new android.widget.TextView(ctx);
		sugPrompt.setText("Localização sujerida para tocar:");
		sugPrompt.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
		sugPrompt.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		sugPrompt.setTextColor(gui.config.colors[config.values.theme].text);
		sugPrompt.setTextSize(16);
		sugPrompt.getLayoutParams().setMargins(0, 5 * dp, 0, 5 * dp);
		layout.addView(sugPrompt);

		var sug = new android.widget.TextView(ctx);
		sug.setText((function(){
			var r = "";
			sheetmgr.pitch_suggestion[item.pitchLevel].places.map(function(e, i) {
				r += ((i == 0 ? "" : "\n") + "• " + e)
			}); 
			return r;
		}()));
		sug.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
		sug.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
		sug.setTextColor(gui.config.colors[config.values.theme].sec_text);
		sug.setTextSize(15);
		sug.getLayoutParams().setMargins(7 * dp, 5 * dp, 0, 7 * dp);
		layout.addView(sug);
		if(item.social) {
			var colorPicker = function(platform) {
				switch(platform) {
					case "coolapk": return "#11B566";
					case "twitter": return "#1DA1F2";
					case "douyin": return (function(){
						if(config.values.theme == "light") {
							return "#1F0B1A";
						} else {
							return "#FFFFFF";
						}
					}());
					case "github": return (function(){
						if(config.values.theme == "light") {
							return "#24292E";
						} else {
							return "#FFFFFF";
						}
					}());
					case "bilibili": return "#FB7299";
				}
			}
			var filterBitmap = function(bitmap, replacedColor) {
				var rBitmap = android.graphics.Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), android.graphics.Bitmap.Config.ARGB_8888);
				var canvas = new android.graphics.Canvas(rBitmap);
				var paint = new android.graphics.Paint();
				var rect = new android.graphics.Rect(0, 0, bitmap.getWidth(), bitmap.getHeight());
				paint.setAntiAlias(true);
				canvas.drawARGB(0, 0, 0, 0);
				paint.setColorFilter(new android.graphics.PorterDuffColorFilter(replacedColor, android.graphics.PorterDuff.Mode.SRC_IN));
				canvas.drawBitmap(bitmap, rect, rect, paint);
				return rBitmap;
			};
			var socialPrompt = new android.widget.TextView(ctx);
			socialPrompt.setText("Ver autor:");
			socialPrompt.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
			socialPrompt.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
			socialPrompt.setTextColor(gui.config.colors[config.values.theme].text);
			socialPrompt.setTextSize(16);
			socialPrompt.getLayoutParams().setMargins(0, 5 * dp, 0, 5 * dp);
			layout.addView(socialPrompt);
			var socialLayout = new android.widget.LinearLayout(ctx);
			socialLayout.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, -2));
			socialLayout.setOrientation(android.widget.LinearLayout.HORIZONTAL);
			socialLayout.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
			socialLayout.getLayoutParams().setMargins(dp * 2, dp * 6, dp * 2, 0);
			socialLayout.setPadding(5 * dp, 5 * dp, 5 * dp, 5 * dp);
			socialLayout.measure(0, 0);
			if(item.social.length == 1) {
				var socialImage = new android.widget.ImageView(ctx);
				socialImage.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				socialImage.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 34, dp * 34));
				socialImage.getLayoutParams().setMargins(0, 0, dp * 5, 0);
				socialImage.setImageBitmap(filterBitmap(config.bitmaps[item.social[0].platform], android.graphics.Color.parseColor(colorPicker(item.social[0].platform))));
				socialLayout.addView(socialImage);
				var socialPrompt1 = new android.widget.TextView(ctx);
				socialPrompt1.setText(android.text.Html.fromHtml(("não <font color=" + colorPicker(item.social[0].platform) + ">" + item.social[0].name +"</font> ver autor")));
				socialPrompt1.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-2, dp * 34));
				socialPrompt1.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				socialPrompt1.setTextColor(gui.config.colors[config.values.theme].text);
				socialPrompt1.setTextSize(14);
				socialLayout.addView(socialPrompt1);
				socialLayout.setBackgroundDrawable(gui.utils.ripple_drawable(socialLayout.getMeasuredWidth(), socialLayout.getMeasuredHeight(), "rect"));
				socialLayout.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						app.openUrl(item.social[0].link);
					}
				}));
			} else {
				for(var i in item.social) {
					var socialImage = new android.widget.ImageView(ctx);
					socialImage.setId(i);
					socialImage.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
					socialImage.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp * 34, dp * 34));
					socialImage.getLayoutParams().setMargins(dp * 5, 0, dp * 5, 0);
					socialImage.setImageBitmap(filterBitmap(config.bitmaps[item.social[i].platform], android.graphics.Color.parseColor(colorPicker(item.social[i].platform))));
					socialImage.measure(0, 0);
					socialImage.setBackgroundDrawable(gui.utils.ripple_drawable(socialImage.getMeasuredWidth(), socialImage.getMeasuredHeight(), "rect"));
					socialImage.setOnClickListener(new android.view.View.OnClickListener({
						onClick: function(view) {
							print(view.getId())
							app.openUrl(item.social[view.getId()].link);
						}
					}));
					socialLayout.addView(socialImage);
				}
			}
			layout.addView(socialLayout);
		}
		scr.addView(layout);
		
		return scr;
	});
	gui.main.addPage({
		index: 0, 
		title: "@iamjunioru - Partituras locais", 
		navigation_title: "Local",
		navigation_icon: "local",
		func: [{
			icon: "refresh",
			onClick: function(s, selfContent) {
				selfContent.getSheetList(s, true);
			},
		}],
		view: function(s) {
			s.ns0_rl = new android.widget.RelativeLayout(ctx);
			s.ns0_rl.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			
			s.ns0_listView = new android.widget.ListView(ctx);
			s.ns0_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns0_listView.setAdapter(s.ns0_listAdapter = new RhinoListAdapter([], function self(element) {
				element.v_relative = new android.widget.RelativeLayout(ctx);
				element.v_relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				if(element.type == -1) {
					element.v_info = new android.widget.ImageView(ctx);
					element.v_info.setId(10);
					element.v_info.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
					element.v_info.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
					element.v_info.getLayoutParams().setMargins(dp * 15, dp * 10, dp * 5, dp * 10);
					element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
					element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
					element.v_info.setImageBitmap(config.bitmaps.info);
					element.v_relative.addView(element.v_info);
					
					element.v_upload = new android.widget.TextView(ctx);
					element.v_upload.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
					element.v_upload.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
					element.v_upload.getLayoutParams().setMargins(dp * 7, dp * 5, dp * 15, dp * 10);
					element.v_upload.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
					element.v_upload.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 10);
					element.v_upload.setTextSize(13);
					element.v_upload.setTextColor(gui.config.colors[config.values.theme].sec_text);
					element.v_upload.setText(element.title);
					element.v_relative.addView(element.v_upload);
					return element.v_relative;
				}
				
				element.v_title = new android.widget.TextView(ctx);
				element.v_title.setId(10);
				element.v_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
				element.v_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
				element.v_title.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 15, element.failed ? dp * 15 : dp * 1);
				element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
				if(element.failed) element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				element.v_title.setTextSize(16);
				element.v_title.setTextColor(element.failed ? gui.config.colors[config.values.theme].sec_text : gui.config.colors[config.values.theme].text);
				element.v_title.setText(element.failed ? android.text.Html.fromHtml("<s>" + element.fileName + "</s>") : element.name);
				element.v_relative.addView(element.v_title);
				
				if(!element.failed) {
					element.v_author = new android.widget.TextView(ctx);
					element.v_author.setId(11);
					element.v_author.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
					element.v_author.getLayoutParams().setMargins(dp * 15, dp * 1, dp * 15, dp * 15);
					element.v_author.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 10);
					element.v_author.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
					element.v_author.setTextSize(14);
					element.v_author.setTextColor(gui.config.colors[config.values.theme].sec_text);
					element.v_author.setText("Número de teclas: " + element.songNotes.length + " - BPM: " + element.bpm);
					element.v_relative.addView(element.v_author);
					
					element.v_play = new android.widget.ImageView(ctx);
					element.v_play.setId(12);
					element.v_play.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
					element.v_play.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 39, dp * 39));
					element.v_play.getLayoutParams().setMargins(0, dp * 15, dp * 15, dp * 15);
					element.v_play.setPadding(dp * 7, dp * 7, dp * 7, dp * 7);
					element.v_play.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
					element.v_play.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
					element.v_play.setImageBitmap(config.bitmaps.play);
					element.v_play.measure(0, 0);
					element.v_play.setBackgroundDrawable(gui.utils.ripple_drawable(element.v_play.getMeasuredWidth(), element.v_play.getMeasuredHeight(), "rect"));
					element.v_play.setOnClickListener(new android.view.View.OnClickListener({
						onClick: function() {
							if(gui.main.isShowing) {
								if(!element.keyCount) {
									gui.dialogs.showConfirmDialog({
										title: "Defina o número de teclas/chaves",
										text: "Esta é uma partitura local. Defina o número de teclas para esta partitura:",
										canExit: true,
										buttons: ["• 8 teclas", "• 15 teclas"],
										callback: function(id) {
											files.write(files.join(sheetmgr.rootDir, element.fileName), (function() {
												var readable = files.open(files.join(sheetmgr.rootDir, element.fileName), "r", sheetmgr.encoding);
												var parsed = eval(readable.read())[0];
												readable.close();
												parsed.keyCount = id == 0 ? (element.keyCount = 8) : (element.keyCount = 15)
												return "[" + JSON.stringify(parsed) + "]";
											}()), sheetmgr.encoding);
											toast("foi " + element.name + " Definir como " + element.keyCount + " Pontuação de tecla\nPor favor, clique no botão play novamente.\nPressione longamente a pontuação para redefinir o número de teclas.");
										},
									});
								} else {
									switch(element.keyCount) {
										case 8: {
											if(config.values.key_coordinates8.length != 8) {
												toast("8 coordenadas de tecla não está definida ou os dados da coordenada estão errados，vá para a página de configurações para definir a posição delas.");
												return true;
											}
										};break;
										case 15: {
											if(config.values.key_coordinates15.length != 15) {
												toast("8 coordenadas de tecla não está definida ou os dados da coordenada estão errados，vá para a página de configurações para definir a posição delas.");
												return true;
											}
										};break;
									}
									gui.main.__internal_dismiss();
									gui.player_panel.__internal_showPanel(element);
								}

							}
							return true;
						}
					}));
					element.v_relative.addView(element.v_play);
				}
				element.v_delete = new android.widget.ImageView(ctx);
				element.v_delete.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
				element.v_delete.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 39, dp * 39));
				element.v_delete.getLayoutParams().setMargins(dp * 15, dp * 15, element.failed ? dp * 15 : 0, dp * 15);
				element.v_delete.setPadding(dp * 7, dp * 7, dp * 7, dp * 7);
				if(element.failed) {
					element.v_delete.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
				} else {
					element.v_delete.getLayoutParams().addRule(android.widget.RelativeLayout.LEFT_OF, 12);
				}
				element.v_delete.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
				element.v_delete.setImageBitmap(config.bitmaps.bin);
				element.v_delete.measure(0, 0);
				element.v_delete.setBackgroundDrawable(gui.utils.ripple_drawable(element.v_delete.getMeasuredWidth(), element.v_delete.getMeasuredHeight(), "rect"));
				element.v_delete.setOnClickListener(new android.view.View.OnClickListener({
					onClick: function() {
						var path = files.join(sheetmgr.rootDir, element.fileName);
						gui.dialogs.showConfirmDialog({
							title: "Deletar arquivos",
							text: "Confirme para excluir " + path + " Tem certeza？\nNão há como voltar atrás！",
							canExit: true,
							buttons: ["Confirmar", "Cancelar"],
							callback: function(id) {
								if(id == 0) {
									files.remove(path);
									gui.main.getPage(0).getSheetList(s, true);
								}
							},
						});
						return true;
					}
				}));
				element.v_relative.addView(element.v_delete);	
				return element.v_relative;
			}));
			s.ns0_listAdapterController = RhinoListAdapter.getController(s.ns0_listAdapter);
			
			s.ns0_listView.setAdapter(s.ns0_listAdapterController.self);
			s.ns0_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns0_listAdapterController.get(pos);
					if(item.type == -1) {
						switch(item.index) {
							case 0: {
								gui.dialogs.showConfirmDialog({
									title: "Deseja saber como importar partituras locais?",
									text: android.text.Html.fromHtml(String("A pasta de partituras locais está em" + (function(){
										try {
											android.os.Build.VERSION_CODES.R
											return "<b>Pasta de documentos padrão Android</b>sob"
										} catch (e) {
											return "<b>Local de armazenamento de partituras musicais do SkyStudio</b>";
										}
									}()) + "\n" + 
										"<u><b>" + sheetmgr.rootDir + "</u></b>\n" + 
										"Copie a partitura externa para esta pasta\n\n" + 
										"Nota：\n" + 
										"Uso do SkyStudio para armazenamento/leitura de partituras musicais<u><b>" + sheetmgr.encoding.toUpperCase() + "</u></b>编码\n" + 
										"Certifique-se de que a codificação da partitura externa seja consistente com a codificação usada pelo SkyStudio\n").replace(new RegExp("\x0a", "gi"), "<br>")),
									canExit: true,
									skip: function(checked) {
										config.values.skipImportLocalSheetTip = config.save("skip_import_local_sheet_tip", checked);
										if(checked) s.ns0_listAdapterController.removeByIndex(pos, true);
									},
									buttons: ["Confirmar"]
								});
								break;
							}
							case 1: {
								gui.dialogs.showConfirmDialog({
									title: "Modifique o número de teclas de pontuação",
									text: "A versão 15 adiciona suporte para pontuações de diferentes instrumentos principais(8 e 15 teclas), que usam dados de coordenadas diferentes.\n" + 
										"Partituras musicais atualmente armazenadas localmente(partituras importadas externamente ou partituras baixadas de partituras compartilhadas antes da versão 15)，Eles não possuem informações importantes e o SkyAutoPlayerScript não pode confirmar se é uma partitura de 8 ou 15 teclas.\n" + 
										"As informações da pontuação compartilhada foram atualizadas. Agora, a pontuação compartilhada baixada já contém as informações principais da pontuação, portanto, não há necessidade de defini-la novamente.\n" + 
										"Quando você clica no botão para iniciar a reprodução, se não houver informações da posição da chave, uma caixa de diálogo aparecerá para selecionar a posição da chave da pontuação e o SkyAutoPlayerScript salvará as informações da posição da chave na partitura.\n" + 
										"Se você definir a informação chave errada por algum motivo, você pode pressionar longamente a pontuação para zerá-la.\n\n" + 
										"p.s.: Você precisa redefinir a posição da chave 15.",
									canExit: true,
									skip: function(checked) {
										config.values.skipChangeKeyCountTip = config.save("skip_change_key_count_tip", checked);
										if(checked) s.ns0_listAdapterController.removeByIndex(pos, true);
									},
									buttons: ["Confirmar"]
								});
								break;
							}
						}
						return true;
					}
					if(item.failed) {
						gui.dialogs.showConfirmDialog({
							title: "carga" + item.fileName + "falha",
							text: android.text.Html.fromHtml(String("Carregar partituras" + item.fileName + "falha\n\nmotivo：\n" + item.reason + "\n\nPor favor, verifique o seguinte：\n" + 
								(item.errtype == -1 ? "<b>1. Se a codificação da partitura é UTF16-LE</b>\n" : "<s>1. Se a codificação da partitura é UTF16-LE</s>\n") + 
								(item.errtype == 1 ? "<b>2. Se a pontuação está no formato JSON não criptografado</b>\n" : "<s>2. Se a pontuação está no formato JSON não criptografado</s>\n") + 
								(item.errtype == 2 ? "<b>3. A partitura tem erros de sintaxe JSON</b>" : "<s>3. A partitura tem erros de sintaxe JSON</s>")
							).replace(new RegExp("\x0a", "gi"), "<br>")), 
							canExit: true,
							buttons: ["Confirmar"]
						});
					} else { 
						gui.dialogs.showDialog(gui.getViewMaker("sheetInfo")(item), -2, -2, null, true);
					}
					
				}
			}));
			s.ns0_listView.setOnItemLongClickListener(new android.widget.AdapterView.OnItemLongClickListener({
				onItemLongClick: function(parent, view, pos, id) {
					var item = s.ns0_listAdapterController.get(pos);
					if(!item.failed && item.type == 0) {
						gui.dialogs.showConfirmDialog({
							title: "Defina o número de teclas/chaves",
							text: "Esta é uma partitura local. Defina o número de teclas para esta partitura:",
							canExit: true,
							buttons: ["• 8 teclas", "• 15 teclas"],
							callback: function(id) {
								files.write(files.join(sheetmgr.rootDir, item.fileName), (function() {
									var readable = files.open(files.join(sheetmgr.rootDir, item.fileName), "r", sheetmgr.encoding);
									var parsed = eval(readable.read())[0];
									readable.close();
									parsed.keyCount = id == 0 ? (item.keyCount = 8) : (item.keyCount = 15)
									return "[" + JSON.stringify(parsed) + "]";
								}()), sheetmgr.encoding);
								toast("Foi " + item.name + " Definir como " + item.keyCount + " Pontuação chave\nPor favor, clique no botão play novamente.\nPressione na partitura para redefinir o número de teclas");
							},
						});
					}
					return true;
				},
			}));
			s.ns0_rl.addView(s.ns0_listView);
			
			s.ns0_progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
			s.ns0_progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
			s.ns0_progress.setTranslationY(dp * 5);
			s.ns0_progress.setPadding(0, 0, 0, 0);
			s.ns0_progress.getLayoutParams().setMargins(0, 0, 0, 0);
			s.ns0_progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
			s.ns0_progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors[config.values.theme].background));
			s.ns0_progress.setIndeterminate(true);
			s.ns0_progress.setAlpha(0);
			
			s.ns0_rl.addView(s.ns0_progress);
			return s.ns0_rl;
		},
		update: function(s) {
			if(s.initial) this.getSheetList(s, false);
		},
		getSheetList: function(s, isForce) {
			gui.run(function() {
				s.ns0_progress.setIndeterminate(true);
				s.ns0_listAdapterController.removeAll();
				gui.main.setFuncClickable(s.index, false);
				gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				gui.utils.value_animation("Float", 1.0, 0, 100, new android.view.animation.DecelerateInterpolator(), function(anim) {
					s.ns0_listView.setAlpha(anim.getAnimatedValue());
					s.ns0_progress.setAlpha(1 - anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						s.ns0_listView.setAlpha(1);
						if(!config.values.skipImportLocalSheetTip) s.ns0_listAdapterController.add({
							type: -1,
							title: "Como importar partituras locais",
							index: 0
						});//Dicas de pontuação de upload
						if(!config.values.skipChangeKeyCountTip) s.ns0_listAdapterController.add({
							type: -1,
							title: "Modifique o número de teclas de partitura",
							index: 1
						});//Modifique a posição-chave da partitura
						s.ns0_listAdapterController.notifyChange();
						threads.start(function() {
							sheetmgr.getLocalSheetList(isForce, function(successCount, failedCount) {
								gui.run(function(){
									gui.main._global_title.setText("Carregando " + successCount + " partituras ~" + failedCount + " falhou");
								});
							}).map(function(e, i) {
								gui.run(function(){
									if(!e.failed || config.values.showFailedSheets) {
										s.ns0_listAdapterController.add((function(item) {
											item.type = 0;
											return item;
										}(e)));
									}
								});
							});
							gui.run(function() {
								gui.main.setFuncClickable(s.index, true);
								s.ns0_listAdapterController.notifyChange();
								gui.main._global_title.setText(gui.main.getPageInfo(s.index).title);
								gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.main._global_title.setAlpha(anim.getAnimatedValue());
									s.ns0_listView.setAlpha(anim.getAnimatedValue());
									s.ns0_progress.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 1.0) s.ns0_progress.setIndeterminate(false);
								});
							});
						});
					}
				});
			});
		}
	});
	gui.main.addPage({
		index: 1, 
		title: "Partituras compartilhadas",
		navigation_title: "Nuvem", 
		navigation_icon: "online",
		func: [{
			icon: "refresh",
			onClick: function(s, selfContent) {
				if(s.ns1_isShowingSearchEditTextView) selfContent.removeSearchEditTextView(s, selfContent);
				selfContent.getOnlineSheetList(s, true);
			},
		},/* {
			icon: android.graphics.Bitmap.createBitmap(config.bitmaps.filter),
			onClick: function(s, selfContent) {
				toast("Click filter")
			},
		},*/ {
			icon: "search",
			onClick: function(s, selfContent) {
				if(s.ns1_isShowingSearchEditTextView) {
					selfContent.removeSearchEditTextView(s, selfContent);
				} else {
					selfContent.showSearchEditTextView(s, selfContent);
				}
			},
		}],
		view: function(s) {
			
			s.ns1_rl = new android.widget.RelativeLayout(ctx);
			s.ns1_rl.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			
			s.ns1_listView = new android.widget.ListView(ctx);
			s.ns1_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns1_listView.setAdapter(s.ns1_listAdapter = new RhinoListAdapter([], function self(element) {
				
				element.v_relative = new android.widget.RelativeLayout(ctx);
				element.v_relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				element.isShowingStatusBar = false;

				switch(element.type) {
					//top notification
					case -1: {
						element.v_info = new android.widget.ImageView(ctx);
						element.v_info.setId(10);
						element.v_info.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
						element.v_info.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 25, dp * 25));
						element.v_info.getLayoutParams().setMargins(dp * 15, dp * 10, dp * 5, dp * 10);
						element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
						element.v_info.setImageBitmap(config.bitmaps.info);
						element.v_relative.addView(element.v_info);
						
						element.v_upload = new android.widget.TextView(ctx);
						element.v_upload.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						element.v_upload.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_upload.getLayoutParams().setMargins(dp * 7, dp * 5, dp * 15, dp * 10);
						element.v_upload.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
						element.v_upload.getLayoutParams().addRule(android.widget.RelativeLayout.RIGHT_OF, 10);
						element.v_upload.setTextSize(13);
						element.v_upload.setTextColor(gui.config.colors[config.values.theme].sec_text);
						element.v_upload.setText(element.title);
						element.v_relative.addView(element.v_upload);
					};break;
					case -2: {
						//empty result view
					};break;
					default: {
						//sheet item
						element.v_title = new android.widget.TextView(ctx);
						element.v_title.setId(10);
						element.v_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						element.v_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_title.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 15, dp * 1);
						element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_title.setTextSize(16);
						element.v_title.setTextColor(gui.config.colors[config.values.theme].text);
						element.v_title.setText(element.name);
						element.v_relative.addView(element.v_title);
						
						element.v_info = new android.widget.TextView(ctx);
						element.v_info.setId(11);
						element.v_info.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_info.getLayoutParams().setMargins(dp * 15, dp * 1, dp * 15, dp * 2);
						element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 10);
						element.v_info.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_info.setTextSize(15);
						element.v_info.setTextColor(gui.config.colors[config.values.theme].text);
						element.v_info.setText(element.author);
						element.v_relative.addView(element.v_info);
						
						element.v_desc = new android.widget.TextView(ctx);
						element.v_desc.setId(12);
						element.v_desc.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
						element.v_desc.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 11);
						element.v_desc.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_desc.setTextSize(13);
						element.v_desc.setTextColor(gui.config.colors[config.values.theme].sec_text);
						element.v_desc.setText(android.text.Html.fromHtml(element.desc.replace(new RegExp("\x0a", "gi"), "<br>")));
						element.v_relative.addView(element.v_desc);
						
						element.download = new android.widget.ImageView(ctx);
						element.download.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
						element.download.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(dp * 45, dp * 45));
						element.download.getLayoutParams().setMargins(dp * 15, dp * 15, dp * 5, dp * 15);
						element.download.setPadding(dp * 10, dp * 10, dp * 10, dp * 10);
						element.download.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
						element.download.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
						element.download.setImageBitmap(config.bitmaps.download);
						element.download.measure(0, 0);
						element.download.setBackgroundDrawable(gui.utils.ripple_drawable(element.download.getMeasuredWidth(), element.download.getMeasuredHeight(), "rect"));
						element.download.setOnClickListener(new android.view.View.OnClickListener({
							onClick: function() { threads.start(function() {
								if(!element.isShowingStatusBar) sheetmgr.downloadAndLoad(element.file, {author: element.author, keyCount: element.keyCount}, function(r) {
									switch(r.status) {
										case 1: {
											gui.run(function() {
												element.v_status.setText("baixando...");
												element.v_relative.addView(element.v_status);
												element.v_relative.addView(element.v_progress);
												element.isShowingStatusBar = true;
												element.v_progress.setIndeterminate(true);
												element.v_desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 1);
												gui.utils.value_animation("Float", 0, 1.0, 150, new android.view.animation.DecelerateInterpolator(), function(anim) {
													element.v_progress.setAlpha(anim.getAnimatedValue());
													element.v_status.setAlpha(anim.getAnimatedValue());
												});
											});
											break;
										}
										case 2: {
											if(gui.main.isShowing) gui.run(function() {
												element.v_status.setText("Análisando....");
											});
											break;
										}
										case 3: {
											if(gui.main.isShowing) { gui.run(function() { 
												toast("Transferência concluída: " + element.name + "\nAtualize na página de partitura local");
												gui.utils.value_animation("Float", 1, 0, 150, new android.view.animation.DecelerateInterpolator(), function(anim) {
													element.v_progress.setAlpha(anim.getAnimatedValue());
													element.v_status.setAlpha(anim.getAnimatedValue());
													if(anim.getAnimatedValue() == 0) {
														element.v_desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
														element.v_relative.removeView(element.v_status);
														element.v_relative.removeView(element.v_progress);
														element.isShowingStatusBar = false;
													}
												});
											});}
											break;
										}
										case -1: {
											if(gui.main.isShowing) { gui.run(function() { 
												toast("baixar" + element.name + "falha: " + r.msg);
												gui.utils.value_animation("Float", 1, 0, 150, new android.view.animation.DecelerateInterpolator(), function(anim) {
													element.v_progress.setAlpha(anim.getAnimatedValue());
													element.v_status.setAlpha(anim.getAnimatedValue());
													if(anim.getAnimatedValue() == 0) {
														element.v_desc.getLayoutParams().setMargins(dp * 15, dp * 2, dp * 15, dp * 15);
														element.v_relative.removeView(element.v_status);
														element.v_relative.removeView(element.v_progress);
														element.isShowingStatusBar = false;
													}
												});
											});}
											break;
										}
									}
								});
							}); return true;}
						}));
						element.v_relative.addView(element.download);
						
						element.v_status = new android.widget.TextView(ctx);
						element.v_status.setId(13);
						element.v_status.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_status.getLayoutParams().setMargins(dp * 15, 0, dp * 15, 0);
						element.v_status.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 12);
						element.v_status.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_status.setTextSize(13);
						element.v_status.setAlpha(0);
						element.v_status.setTextColor(gui.config.colors[config.values.theme].text);
						
						element.v_progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
						element.v_progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
						element.v_progress.setPadding(0, 0, 0, 0);
						element.v_progress.getLayoutParams().addRule(android.widget.RelativeLayout.BELOW, 13);
						element.v_progress.getLayoutParams().setMargins(dp * 15, 0, dp * 15, dp * 5);
						element.v_progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
						element.v_progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors[config.values.theme].background));
						element.v_progress.setIndeterminate(false);
						element.v_progress.setAlpha(0);
					};break;
				}
				return element.v_relative;
			}));
			s.ns1_listAdapterController = RhinoListAdapter.getController(s.ns1_listAdapter);
			
			s.ns1_listView.setAdapter(s.ns1_listAdapterController.self);
			s.ns1_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns1_listAdapterController.get(pos);
					switch(item.type) {
						case -1: {
							switch(item.index) {
								case 0: {
									gui.dialogs.showConfirmDialog({
										title: "Como fazer upload de partituras",
										text: "Existem duas maneiras de fazer upload de pontuações：\n\n" + 
											"1. Envie uma mensagem privada para @iamjunioru ou dream#2001, inclua uma breve introdução e um link da partitura para baixar(Pelo Google Drive, Mediafire, Mega ou outros sites de download).\n" + 
											"2. Faça uma requisição em iamjunioru/SkyAutoplayer-BR no github ou gitee;\n" + 
											"• Adicione sua partitura na pasta shared_sheets e modifique o arquivo shared_sheets.json de acordo com o formato.\n" + 
											"• Após isto, basta enviar um pull request.\n\n" + 
											"Nota: Se você pegou de outra pessoa, dê os créditos ao autor original\n\n" + 
											"Se ninguém contribuir com isso, a lista nunca se expandirá. :/",
										canExit: true,
										skip: function(checked) {
											config.values.skipOnlineUploadTip = config.save("skip_online_upload_tip", checked);
											if(checked) s.ns1_listAdapterController.removeByIndex(pos, true);
										},
										buttons: ["Entrar em contato", "Abrir o Github", "Cancelar"],
										callback: function(id) {
											if(id == 0) {
												if(!app.openUrl("https://www.instagram.com/dreaw7/")) toast("Direcionando ao Instagram...");
											} else if(id == 1) {
												app.openUrl("https://github.com/iamjunioru/SkyAutoplayerBR/");
											}
										},
									});
									break;
								}
								case 1: {
									gui.dialogs.showConfirmDialog({
										title: "Declaração de compartilhamento de partituras",
										text: android.text.Html.fromHtml(String("As partituras compartilhadas(<i>shared_sheets</i>) estão em: \n<b><a href=https://github.com/iamjunioru/SkyAutoPlayer-BR>github.com/iamjunioru/SkyAutoPlayer-BR</a></b>\n Confere lá!\n\n" + 
											"1. A partitura original não é sua? <b><u> Não compartilhe e use apenas no SkyAutoplayer-BR.</u></b>.\n" + 
											"• Não divulgue para outras plataformas caso <b>não tenha a autorização do criador, por favor.</b>！\n\n" + 
											"2. As partituras reproduzidas nesta lista de <i>shared_sheets</i> são monitoradas.\n" + 
											"• Caso divulgue, <b>indique a autorização do autor original</b> ou <b>siga os desejos do autor original.</b>\n\n" + 
											"Esta declaração não é exequível, é uma manifestação de talentos e esforço pessoais.\n" + 
											"<b><u>~benefícios ilegais são indesejáveis, principalmente para alguém que cria e se esforça para fazer partituras tão elaboradas.</b></u>").replace(new RegExp("\x0a", "gi"), "<br>")),
										canExit: true,
										skip: function(checked) {
											config.values.skipOnlineSharedSheetCTip = config.save("skip_shared_sheet_c_tip", checked);
											if(checked) s.ns1_listAdapterController.removeByIndex(pos, true);
										},
										buttons: ["Eu compreendo"]
									});
									break;
								}
							}
						};break;
						case -2: {

						};break;
						default: {
							gui.dialogs.showDialog(gui.getViewMaker("sheetInfo")(item), -2, -2, null, true);
						}break;
					}
					return true;
				}
			}));
			s.ns1_rl.addView(s.ns1_listView);
			
			s.ns1_progress = new android.widget.ProgressBar(ctx, null, android.R.attr.progressBarStyleHorizontal);
			s.ns1_progress.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-1, dp * 15));
			s.ns1_progress.setTranslationY(dp * 5);
			s.ns1_progress.setPadding(0, 0, 0, 0);
			s.ns1_progress.getLayoutParams().setMargins(0, 0, 0, 0);
			s.ns1_progress.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
			s.ns1_progress.setProgressDrawable(new android.graphics.drawable.ColorDrawable(gui.config.colors[config.values.theme].background));
			s.ns1_progress.setIndeterminate(true);
			s.ns1_progress.setAlpha(0);
			
			s.ns1_rl.addView(s.ns1_progress);
			return s.ns1_rl;
		},

		onPageChanged: function(s, selfContent) {
			if(s.ns1_isShowingSearchEditTextView) selfContent.removeSearchEditTextView(s);
		},

		showSearchEditTextView: function(s, selfContent) {
			gui.main.setFuncClickable(s.index, false);
			s.ns1_isShowingSearchEditTextView = true;
			s.ns1_searchEditText = new android.widget.EditText(ctx);
			s.ns1_searchEditText.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
			s.ns1_searchEditText.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -1));
			s.ns1_searchEditText.setPadding(dp * 5, dp * 5, dp * 5, dp * 5);
			s.ns1_searchEditText.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
			s.ns1_searchEditText.setTextSize(15);
			s.ns1_searchEditText.setTextColor(gui.config.colors[config.values.theme].text);
			s.ns1_searchEditText.setHintTextColor(gui.config.colors[config.values.theme].sec_text);
			s.ns1_searchEditText.setHint("Pressione aqui para iniciar a pesquisa");
			s.ns1_searchEditText.setAlpha(0);
			s.ns1_searchEditText.setOnClickListener(new android.view.View.OnClickListener({
				onClick: function(view) {
					view.setFocusable(true);
					view.setFocusableInTouchMode(true);
					view.requestFocus();
					ctx.getSystemService(android.content.Context.INPUT_METHOD_SERVICE).showSoftInput(view, 0);
				}
			}));
			s.ns1_searchEditText.setOnKeyListener(new android.view.View.OnKeyListener({
				onKey: function(view, keycode, event) {
					if (keycode == android.view.KeyEvent.KEYCODE_ENTER && event.getAction() == android.view.KeyEvent.ACTION_DOWN) {
						selfContent.getOnlineSheetList(s, false, function(item) {
							return (new RegExp(view.getText(), "gi")).test(item.name);
						});
						return true;
					}
					return false;
				},
			}));
			gui.main._global_statusbar.addView(s.ns1_searchEditText);
			s.ns1_searchEditText.setFocusable(true);
			s.ns1_searchEditText.setFocusableInTouchMode(true);
			s.ns1_searchEditText.requestFocus();
			ctx.getSystemService(android.content.Context.INPUT_METHOD_SERVICE).showSoftInput(s.ns1_searchEditText, 0);
			gui.main._global_title.setEnabled(false);
			gui.main._global_title.setClickable(false);
			gui.utils.value_animation("Float", 0, 1.0, 300 , new android.view.animation.DecelerateInterpolator(), function(anim) {
				s.ns1_searchEditText.setAlpha(anim.getAnimatedValue());
				gui.main._global_title.setAlpha(1.0 - anim.getAnimatedValue());
				if(anim.getAnimatedValue() == 1.0) gui.main.setFuncClickable(s.index, true);
			});
		},
		
		removeSearchEditTextView: function(s, selfContent) { try {
			s.ns1_isShowingSearchEditTextView = false;
			gui.main.setFuncClickable(s.index, false);
			s.ns1_searchEditText.setEnabled(false);
			s.ns1_searchEditText.setClickable(false);
			gui.main._global_title.setEnabled(true);
			gui.main._global_title.setClickable(true);
			gui.utils.value_animation("Float", 0, 1.0, 300 , new android.view.animation.DecelerateInterpolator(), function(anim) {
				s.ns1_searchEditText.setAlpha(1.0 - anim.getAnimatedValue());
				gui.main._global_title.setAlpha(anim.getAnimatedValue());
				if(anim.getAnimatedValue() == 1.0) {
					gui.main._global_statusbar.removeView(s.ns1_searchEditText);
					gui.main.setFuncClickable(s.index, true);
				}
			});
		} catch (e) {}},

		update: function(s) {
			if(s.initial) this.getOnlineSheetList(s, false);
		},
		getOnlineSheetList: function(s, isForce, filterBlock) {
			gui.run(function() {
				gui.main.setFuncClickable(s.index, false);
				s.ns1_progress.setIndeterminate(true);
				s.ns1_listAdapterController.removeAll();
				s.ns1_listAdapterController.notifyChange();
				if(typeof(filterBlock) != "function") gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
					gui.main._global_title.setAlpha(anim.getAnimatedValue());
				});
				gui.utils.value_animation("Float", 1.0, 0, 100, new android.view.animation.DecelerateInterpolator(), function(anim) {
					s.ns1_listView.setAlpha(anim.getAnimatedValue());
					s.ns1_progress.setAlpha(1 - anim.getAnimatedValue());
					if(anim.getAnimatedValue() == 0) {
						if(!config.values.skipOnlineUploadTip) s.ns1_listAdapterController.add({
							type: -1,
							title: "Como fazer upload de partituras",
							index: 0
						});//Dicas de upload de partituras
						if(!config.values.skipOnlineSharedSheetCTip) s.ns1_listAdapterController.add({
							type: -1,
							title: "Declaração de compartilhamento de partituras",
							index: 1
						});//Dicas para compartilhar partituras
						s.ns1_listAdapterController.notifyChange();
						s.ns1_listView.setAlpha(1);
						gui.main._global_title.setText("Carregando lista...");
						threads.start(function() {
							var list = [];
							if(typeof(filterBlock) == "function") {
								list = sheetmgr.filterOnlineSharedSheet(filterBlock);
							} else {
								list = sheetmgr.getOnlineSharedSheetInfoList(isForce);
							}
							list.map(function(e, i) {
								gui.run(function() { s.ns1_listAdapterController.add(e); });
							});
							gui.run(function() {
								gui.main.setFuncClickable(s.index, true);
								s.ns1_listAdapterController.notifyChange();
								gui.main._global_title.setText(gui.main.getPageInfo(s.index).title);
								gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
									s.ns1_listView.setAlpha(anim.getAnimatedValue());
									s.ns1_progress.setAlpha(1 - anim.getAnimatedValue());
									if(anim.getAnimatedValue() == 1.0) s.ns1_progress.setIndeterminate(false);
								});
								if(typeof(filterBlock) != "function") gui.utils.value_animation("Float", 0, 1.0, 200, new android.view.animation.DecelerateInterpolator(), function(anim) {
									gui.main._global_title.setAlpha(anim.getAnimatedValue());
								});
							});
						});
					}
				});
			});
		}
	});
	gui.main.addPage({
		index: 2, 
		title: "Configurações", 
		navigation_title: "Config",
		navigation_icon: "settings",
		view: function(s) {
			s.ns2_listView = new android.widget.ListView(ctx);
			s.ns2_listView.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, s._content_height));
			s.ns2_listView.setAdapter(s.ns2_listAdapter = new RhinoListAdapter((function sList(){
				sList.list = [{
					type: "tag",
					name: "- Configurações básicas", 
				}, {
					type: "default",
					name: "🎹 Definir/mapear 8 coordenadas de teclas do teclado", 
					onClick: function(v) {
						gui.main.__internal_dismiss();
						config.values.key_coordinates8.length = 0;
						gui.key_coordinate_navigation.show(8, function(value) {
							config.values.key_coordinates8.push(value);
						}, function() {
							config.save("key_coordinates8");
							toast("As configurações de coordenadas foram salvas!");
						});
					}
				}, {
					type: "default",
					name: "🎹 Definir/mapear 15 coordenadas de teclas do teclado", 
					onClick: function(v) {
						gui.main.__internal_dismiss();
						config.values.key_coordinates15.length = 0;
						gui.key_coordinate_navigation.show(15, function(value) {
							config.values.key_coordinates15.push(value);
						}, function() {
							config.save("key_coordinates15");
							toast("As configurações de coordenadas foram salvas!");
						});
					}
				}, {
					type: "checkbox",
					name: "🔁 Ativar reprodução aleatória contínua", 
					check: config.values.autoPlay,
					onClick: function(checked) {
						config.values.autoPlay = config.save("auto_play", checked);
					}
				}, {
					type: "checkbox",
					name: "❓ Exibir partituras falhas", 
					check: config.values.showFailedSheets,
					onClick: function(checked) {
						config.values.showFailedSheets = config.save("show_failed_sheets", checked);
					}
				}, {
					type: "checkbox",
					name: "Mostrar prompt de armazenamento ao iniciar o script",
					check: config.values.tipOnAndroidR,
					onClick: function(checked) {
						config.values.tipOnAndroidR = config.save("tip_storage_on_android_r", checked);
					}
				}, {
					type: "default", 
					name: "✨ Escolher tema",
					onClick: function(v) {
						gui.dialogs.showOperateDialog([{
							text: "💫 Filho da Luz"
						}, {
							text: "🖤 Krill"
						}], function(pos) {
							config.values.theme = config.save("theme", pos == 1 ? "dark" : "light");
							config.updateBitmapTheme();
							gui.main.__internal_dismiss();
							var handler = new android.os.Handler();
							handler.postDelayed(function (){
								gui.main.show(gui.main.current);
							}, 500);
						});
					}
				}, {
					type: "tag",
					name: "- Mais opções", 
				}, {
					type: "default",
					name: "❗ Instruções de uso", 
					onClick: function(v) {
						gui.dialogs.showConfirmDialog({
							title: "Termos e Condições",
							text: user_agreements,
							canExit: true,
							buttons: ["Eu compreendo"],
						})
					},
				}, {
					type: "default",
					name: "📜 Ver LICENÇA", 
					onClick: function(v) {
						threads.start(function() {
							config.fetchRepoFile("LICENSE", null, function(body) {
								gui.dialogs.showConfirmDialog({
									title: "GNU GENERAL PUBLIC LICENSE",
									text: body.string(),
									canExit: true,
									buttons: ["Confirmar"],
								});
							});
						});
					},
				}, {
					type: "default",
					name: "📜 Logs de atualização", 
					onClick: function(v) {
						threads.start(function() {
							config.fetchRepoFile("update_log.txt", null, function(body) {
								gui.dialogs.showConfirmDialog({
									title: "Logs de atualização",
									text: body.string(),
									canExit: true,
									buttons: ["Confirmar"],
								});
							});
						});
					},
				}, {
					type: "default",
					name: "❌ Sair", 
					onClick: function(v) {
						gui.main.__internal_dismiss();
						exit();
					},
				}, {
					type: "tag",
					name: "Versão: " + config.values.currentVersion + "(git@" + config.values.gitVersion + ")", 
				}];
				try {
					android.os.Build.VERSION_CODES.R
				} catch (e) {
					sList.list.splice(5, 1);
				}
				return sList.list;
			}()), function self(element) {
				element.v_relative = new android.widget.RelativeLayout(ctx);
				element.v_relative.setLayoutParams(new android.widget.LinearLayout.LayoutParams(-1, -2));
				
				switch(element.type) {
					case "tag":
						element.v_title = new android.widget.TextView(ctx);
						element.v_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						element.v_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_title.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 5, dp * 5);
						element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_title.setTextSize(12);
						element.v_title.setTextColor(gui.config.colors[config.values.theme].sec_text);
						element.v_title.setText(element.name);
						element.v_relative.addView(element.v_title);
					break;
					case "default":
						element.v_title = new android.widget.TextView(ctx);
						element.v_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						element.v_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_title.getLayoutParams().setMargins(dp * 10, dp * 10, dp * 10, dp * 10);
						element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_title.setTextSize(14);
						element.v_title.setTextColor(gui.config.colors[config.values.theme].text);
						element.v_title.setText(element.name);
						element.v_relative.addView(element.v_title);
					break;
					case "checkbox": 
						element.v_title = new android.widget.TextView(ctx);
						element.v_title.setGravity(android.view.Gravity.LEFT | android.view.Gravity.CENTER);
						element.v_title.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_title.getLayoutParams().setMargins(dp * 10, dp * 10, dp * 10, dp * 10);
						element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
						element.v_title.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
						element.v_title.setTextSize(14);
						element.v_title.setTextColor(gui.config.colors[config.values.theme].text);
						element.v_title.setText(element.name);
						element.v_relative.addView(element.v_title);

						element.v_checkbox = new android.widget.CheckBox(ctx);
						element.v_checkbox.setGravity(android.view.Gravity.CENTER | android.view.Gravity.CENTER);
						element.v_checkbox.setLayoutParams(new android.widget.RelativeLayout.LayoutParams(-2, -2));
						element.v_checkbox.getLayoutParams().setMargins(dp * 5, dp * 5, dp * 15, dp * 5);
						element.v_checkbox.getLayoutParams().addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
						element.v_checkbox.getLayoutParams().addRule(android.widget.RelativeLayout.CENTER_VERTICAL);
						element.v_checkbox.setFocusable(false);
						element.v_checkbox.setChecked(element.check);
						element.v_checkbox.setOnCheckedChangeListener(new android.widget.CompoundButton.OnCheckedChangeListener({
							onCheckedChanged: function(checkBox, value) {
								element.onClick(value)
							},
						}));
						element.v_relative.addView(element.v_checkbox);
					break;
				}
				return element.v_relative;
				
			}));
			s.ns2_listAdapterController = RhinoListAdapter.getController(s.ns2_listAdapter);
			s.ns2_listView.setDividerHeight(0);
			s.ns2_listView.setAdapter(s.ns2_listAdapterController.self);
			s.ns2_listView.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
				onItemClick: function(parent, view, pos, id) {
					var item = s.ns2_listAdapterController.get(pos);
					switch(item.type) {
						case "default":
							item.onClick(view);
						break;
						case "checkbox": 
							item.v_checkbox.performClick();
							item.onClick(item.v_checkbox.isChecked());
					}
				}
			}));
			return s.ns2_listView;
		},
	});
	gui.suspension.show();
	o.close();
	//ctx.moveTaskToBack(true);
	if(!config.values.skipRunScriptTip) {
		gui.dialogs.showConfirmDialog({
			title: "Termos e Condições",
			text: user_agreements,
			canExit: false,
			buttons: ["Confirmar"],
			skip: function(checked) {
				config.save("skip_run_script_tip", checked);
			},
			callback: function(id) {},
		});
	}
}, false, false);

});
