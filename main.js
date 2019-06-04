const electron = require('electron');
const url = require('url');
const path = require('path');
const {app,BrowserWindow,Menu,ipcMain,dialog,webContents,ipcRenderer}=electron;
const fs = require('fs');

let mainWindow; 
let addWindow;
global.windtree = null;
global.conf = [];
var parentwindT;


function readconf(){
    fs.readFile('param.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        tab = JSON.parse(data); //now it an object
        conf = tab.configuration[0];
        
    }});
}
readconf();



app.on('ready',function(){

    // créer la fenêtre la charge
    mainWindow = new BrowserWindow({});

    // charge le fichier html dans  la fenêtre
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname,'accueil.html'),
        protocol:'file:',
        slashes:true
    }));

    // si cette fenêtre est fermé alors ferme aussi les autres
    mainWindow.on('closed',function(){
        app.quit();
    })

    mainWindow.on('close',function(){
        console.log("mainwindow se ferme");
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
 
   mainWindow.setMenu(mainMenu);
});

function createAddWindow(){
      // créer la fenêtre la charge
      addWindow = new BrowserWindow({});
    
        console.log("new window");

      // charge le fichier html dans  la fenêtre
      addWindow.loadURL(url.format({
          pathname:path.join(__dirname,'ConfigJeu.html'),
          protocol:'file:',
          slashes:true
      }));
  
      //garbage collection
      addWindow.on('close',function(){
        addWindow = null;
      });
}



var mainMenuTemplate = [
    {
        label:'menu',
        submenu:[
            {
                label:'Quit',
                accelerator: process.platform == 'darwin'?'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
                }

            },
           
            {
                label:'New game',
                click(){
                    openWindowByUrl('configrules.html',null);
                }
            }
            
        ]
    }
];


// agencement d'un menu propre sous MAC sinon petit décalage
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label:'Dev Tools',
        submenu:[
            {
                label:'dev tools',
                accelerator: process.platform == 'darwin'?'Command+I':'Ctrl+I',
               
                click(item,focusedwindow){
                    focusedwindow.toggleDevTools();
                }
            },
            {
    
                
                role:'reload'
            }
        ]
        
    });
   
}


// creation de fonction par url
function openWindowByUrl(urlpage,mymenu){// urlpage n'est pas le chemin absolue mais relatif au dossier

    addWindow = new BrowserWindow({});
    
    console.log("new window");

  // charge le fichier html dans  la fenêtre
  addWindow.loadURL(url.format({
      pathname:path.join(__dirname,urlpage),
      protocol:'file:',
      slashes:true
  }));




 addWindow.setMenu(null);



  //garbage collection
  addWindow.on('close',function(){
    addWindow = null;
  });
}

//catch askfileload
ipcMain.on('askfile-load',function(event){
    console.log("askfile-load");
    const savePath = dialog.showOpenDialog(null);
    console.log(savePath);
    if(savePath !== undefined)
    event.sender.send('repfileload',savePath);
});

//catch askFRule
ipcMain.on('askFRule',function(event){
    console.log("askFRule");
    const savePath = dialog.showOpenDialog(null);
    console.log(savePath);
    if(savePath !== undefined)
    event.sender.send('SFRulep',savePath);
});


//catch askFOperators
ipcMain.on('askFOperators',function(event){
    console.log("askFOperators");
    const savePath = dialog.showOpenDialog(null);
    console.log(savePath);
    if(savePath !== undefined)
    event.sender.send('SFOperatorsp',savePath);
});

//catch askFGraphics
ipcMain.on('askFGraphics',function(event){
    console.log("askFGraphics");
    const savePath = dialog.showOpenDialog(null);
    console.log(savePath);
    if(savePath !== undefined)
    event.sender.send('SFGraphicsp',savePath);
});

//catch askFCustomrules
ipcMain.on('askFCustomrules',function(event){
    console.log("askFCustomrules");
    const savePath = dialog.showOpenDialog(null);
    console.log(savePath);
    if(savePath !== undefined)
    event.sender.send('SFCustomrulesp',savePath);
    event.BrowserWindow.loadURL()
});

// catch askSave
ipcMain.on('askSave',function(event,arg){
    console.log("askSave");
    let content = arg[0]
    const  savePath = dialog.showSaveDialog((fileName) =>{
        
       
    if(fileName)
        fs.writeFile(fileName,content,function(err){
            if(err){
                //event.sender.send('alert',err);
                return console.log(err);
            }

            tab = fileName.split('\\');
            if(tab.length < 2)
                tab = fileName.split('/');
                

            event.sender.send('alert',["file  "+tab[tab.length - 1]+" is save"]);
            
        });
    });
    
});
// catch newGame
ipcMain.on('newGame',function(){
    console.log("try newgame window");
   openWindowByUrl('configrules.html',null);
});

// catch validation-ask
ipcMain.on('validation-ask',function(){
    console.log("valid ask");
    BrowserWindow.getFocusedWindow().loadURL(url.format({
        pathname:path.join(__dirname,'partie.html'),
        protocol:'file:',
        slashes:true
    }));
});

// askCreateWindowTree  //  à changer
ipcMain.on('askCreateWindowTree',function(event){
    openWindowByUrl('treewindow.html',null);
    windtree = addWindow;
   
   parentwindT = event.sender.webContents.id;
   event.sender.send('repCreateWindowTree');
});

ipcMain.on('askParentwindT',function(event){
    console.log('askParentwindT');
    event.sender.send('father',[parentwindT]);
});






ipcMain.on('majParam',function(event,arg){

    conf = arg[0];
    console.log("main majparam0",arg[0].background);
  
});

ipcMain.on('needconf',function(event){
    event.sender.send(conf);
});