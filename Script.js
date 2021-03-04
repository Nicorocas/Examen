/*
    Voy a dejar aqui arriba algunos enlaces utiles para desues:
    Todos los GP Service = https://formacion.esri.es/server/rest/services/RedMadrid/NAServer
    GPService Area= https://formacion.esri.es/server/rest/services/RedMadrid/NAServer/Service%20Area
    Feature Layer = https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer/0
    Feature Service = https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer

*/ 

// como todo codigo empieza con una funcion require, necesitare:
require([
    "esri/map",
    "dojo/on",
    "dojo/dom",

    "esri/layers/FeatureLayer",




    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dojo/domReady!"
], 
function(
    Map, on, dom,
    FeatureLayer,


){ /* comienza la funcion require, primero llamare a todas las variables*/
    /// mapa sobre el que se desarrollara la app
    var map = new Map()

    //feature layer de hospitales, publicada en arcgis online de modo publico y visible
    var featureLayer = new FeatureLayer("https://services8.arcgis.com/BtkRLT3YBKaVGV3g/ArcGIS/rest/services/Centros_de_salud/FeatureServer/0")





}) /* final de la funcion require*/