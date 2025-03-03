/**
 * This script creates a map from Leaflet and gives it different functionalities to allow the user to create and delete data from a database
 * 
 * Author: Jacob Kampf
 * Last edited: 02/25/2025
 */

require([
    "esri/config", 
    "esri/Map", 
    "esri/views/MapView",
    "esri/widgets/Locate",
    "esri/widgets/Search",
    "esri/widgets/BasemapGallery",
    "esri/widgets/Expand",
    "esri/layers/FeatureLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/rest/support/Query"

  ], function(esriConfig, Map, MapView, Locate, Search, BasemapGallery, Expand, FeatureLayer, UniqueValueRenderer, SimpleMarkerSymbol, Query) {
      esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurFOkIusOF1VpY7XrI8On8rT97tNiNbtgFmCtwOvhjfFhOLXkYP94N4hIcMdSHeUciUtB2IWQ_2YVJSdXzi_IWhmWdynaqt-VAFxx-m7QPXP1DZmxEPt6TyPJFH2W9SBFrsQHr3ANSUDx_agoBAH_kBJgf2rPafNi3Gymbl1Y9ob936ZFAViwcKE2ho6AMyipqnfeD2Q6xy6isdIWOpV36ZvShZri_FF0fkzhr7ztkfsZAT1_bPmqfOUP";   

      //Set up Map and Mapview
      const map = new Map({
        basemap: "osm"
      });

      const view = new MapView({
        map: map,
        center: [-94.09564505572541, 43.65061390407357], // Longitude, latitude
        zoom: 15, // Zoom level
        container: "viewDiv", // Div element
        constraints: {
            rotationEnabled: false //Disables right click rotation
        }
      });



      //Set up BasemapGallery 
      const basemapGallery = new BasemapGallery({
        view: view
      });

      //Button to hold basemaps from BasemapGallery
      const basemapExpand = new Expand({
        view: view,
        content: basemapGallery,
      });

      //Set up Locate button
      const locateBtn = new Locate({
        view: view
      });
       
      //Set up Search bar
      const searchWidget = new Search({
        view: view
      });

      //Div to hold Locate Me, Search, and BasemapExpand
      const toolsDiv = document.createElement("div");
      toolsDiv.classList.add("esri-widget");
      toolsDiv.style.padding = "10px";

      // Add widgets properly using view.ui.add()
      view.ui.add(locateBtn);
      view.ui.add(searchWidget);
      view.ui.add(basemapExpand);

      //Add widgets to container
      toolsDiv.appendChild(locateBtn.container);
      toolsDiv.appendChild(searchWidget.container);
      toolsDiv.appendChild(basemapExpand.container);

      //Create Expand widget to hold tools
      const expandWidget = new Expand({
        view: view,
        content: toolsDiv,
        expandIcon: "layers"
      });
      view.ui.add(expandWidget, "top-left");


      // Create featurelayer from feature service 
      const layer = new FeatureLayer({ 
        // URL to the service 
        url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/survey123_2fd3abfee008406399dd31d9f4a9a07e_results/FeatureServer",
        outFields: ["*"],
        popupTemplate: {
          title: "{Trip Name} - {Attraction Name}",
          content: `
            <b>User: </b> {_user} <br>
            <b>Date Visited: </b> {Date Visited} <br>
            <b>Description: </b> {Description} <br>
            {IMG_4222.jpg}
            `
        }
      });
      map.add(layer);


    }
);
