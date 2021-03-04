/*
    Voy a dejar aqui arriba algunos enlaces utiles para desues:
    Todos los GP Service = https://formacion.esri.es/server/rest/services/RedMadrid/NAServer
    GPService Area= https://formacion.esri.es/server/rest/services/RedMadrid/NAServer/Service%20Area
    Feature Layer = https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer/0
    Feature Service = https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer

    SvArea API = https://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Network/USA/NAServer/Service Area
*/ 

// como todo codigo empieza con una funcion require, necesitare:
require([
    "esri/map",
    "dojo/on",
    "dojo/dom",
    "dojo/parser",
    "dojo/ready",

    "esri/tasks/FeatureSet",
    "esri/layers/FeatureLayer",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol", 
    "esri/symbols/SimpleFillSymbol",

    "esri/geometry/Point",
    "esri/graphic",
    "dojo/_base/Color",
    "dojo/_base/array",
    

    "esri/dijit/BasemapGallery",
    "esri/dijit/Scalebar",
    
    "esri/toolbars/draw",
    "esri/dijit/Popup", 
    "esri/dijit/PopupTemplate",
    "dojo/dom-class", 
    "dojo/dom-construct",
    "esri/tasks/query",
    "esri/tasks/QueryTask",

    "dijit/form/Button",
    "esri/tasks/ServiceAreaTask", 
    "esri/tasks/ServiceAreaParameters",
    "dgrid/Selection",
    

    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dojo/domReady!"
], 
function(
    Map, on, dom,  parser, ready,
    FeatureSet,
    FeatureLayer,PictureMarkerSymbol,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,
    Point,Graphic,Color, arrayUtils,
    BasemapGallery, Scalebar,
    Draw, Popup,PopupTemplate,domClass, domConstruct, Query,QueryTask,
    Button,ServiceAreaTask,ServiceAreaParameters,Selection,
)
{ /* comienza la funcion require, primero llamare a todas las variables*/
    //primero el ready 
    ready(function () {
        var facilities
        // ahora el parser
        parser.parse();
        // simbología
        var SimboloHospi = new PictureMarkerSymbol("http://www.marketingmedico.com/wp-content/blogs.dir/3/files/cruz-roja.jpg")
        var symbolSelected = new SimpleMarkerSymbol({
            "type": "esriSMS",
            "style": "esriSMSSquare",
            "color": [100, 0, 100, 128],
            "size": 6,
            "outline": {
                "color": [255, 0, 200, 214],
                "width": 1
            }
        }); 
        var polygonSymbol = new SimpleFillSymbol(
            "solid",  
            new SimpleLineSymbol("solid", new Color([232,104,80]), 2),
            new Color([232,104,80,0.25])
          );
        //Un popUp como no para la capa de puntos de hospitales, tengo que caragar Popup, templatePopUp, simbologías 
        var popup = new Popup({
            fillSymbol: symbolSelected,
            
            titleInBody: true
        }, domConstruct.create("div"));
        //Add the dark theme which is customized further in the <style> tag at the top of this page
        popup.maximize()
        domClass.add(popup.domNode, "dark");


        // aqui viene el template lo que sera la base del popup, tanto el formato como el contenido, En la Feature layer se pone infoTemplate: template
        const CamposHospit = ["NOMBRE","INFOR","MUNICIPIO","beneficiar"]
        var template = new PopupTemplate({
            title: "{NOMBRE}",
            description: "El {NOMBRE} se situa en la {INFOR} en el municipio de {MUNICIPIO}, y befenicia a un total de {beneficiar} personas",
            fieldInfos: [{ 
                fieldName: "NOMBRE",
                label: "Nombre del centro de salud",
                visible:true
            },
            { 
                fieldName: "INFOR",
                label: "Localización escrita",
                visible:true
            },
            {
                fieldName: "MUNICIPIO",
                label: "Municipio",
                visible:true
            },
            { 
                fieldName: "beneficiar",
                label: "Total de Personas beneficiarias",
                visible:true
            },],
            
        });



        /// mapa sobre el que se desarrollara la app
        var map = new Map("Mapa", {
            basemap: "topo",
            center: [-3.70,40.41], 
            zoom: 12,
            sliderStyle: "small",
            infoWindow: popup // aqui se añade el popUp
            });
        
        

        //feature layer de hospitales, publicada en arcgis online de modo publico y visible
        var featureLayer = new FeatureLayer("https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer/0",{
            outFields: CamposHospit,
            // mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: template,
        })
        map.addLayer(featureLayer)
        
        console.log(featureLayer)
        
        //Algunos widgets
            /// BasemapGallery
            var basemapGallery = new BasemapGallery({
                showArcGISBasemaps: true,
                map: map
                }, "basemapGallery");
                basemapGallery.startup();
            /// escala abajo
            var scalebar = new Scalebar({
                map: map,
                scalebarUnit: "dual"
                });
        
        /// Area de Servicio: 
        // quiero que se ejecute para todas las entidades, o pudiendo elegir una entidad, por la base sera a partir de un boton en el que hacer click y generar el area de servicio
        map.on("load", queryk)

        // definir el servicio y sus parametros
        
        var params = new ServiceAreaParameters();
        params.defaultBreaks= [1000];
        params.outSpatialReference = map.spatialReference;
        

        // uno de los parametros es facilities y se necesita un featureSet de entrada que contenga los graphicos de las entidades del feature service
        
        serviceAreaTask = new ServiceAreaTask("https://formacion.esri.es/server/rest/services/RedMadrid/NAServer/Service%20Area");
        // lo que tengo que conseguir ahora es que se haga el service Area Task en todos los hospitales a la vez, siendo estos los puntos de entrada
       function queryk(params) {
           /// hay que hacer una query 
            var nuevaquery = new Query()
            nuevaquery.where="1=1"
            featureLayer.selectFeatures(nuevaquery, FeatureLayer.SELECTION_NEW)
            
            featureLayer.on("selection-complete",Areaservicio)
            
       }
       function Areaservicio(parametrs) {
           console.log(parametrs)
           var featureSet = new FeatureSet();
           featureSet.features = parametrs;
           params.facilities = featureSet
           
           console.log(params)
           serviceAreaTask.solve(params, function (func) {
              
            
               console.log(func)
               
           })
            
       }
       
    })      
}) 