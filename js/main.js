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
    "esri/rest/support/Query",
    "esri/views/layers/FeatureLayerView"

  ], 
  function(esriConfig, Map, MapView, Locate, Search, BasemapGallery, Expand, FeatureLayer, UniqueValueRenderer, SimpleMarkerSymbol, Query, FeatureFilter) {
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurFOkIusOF1VpY7XrI8On8rT97tNiNbtgFmCtwOvhjfFhOLXkYP94N4hIcMdSHeUciUtB2IWQ_2YVJSdXzi_IWhmWdynaqt-VAFxx-m7QPXP1DZmxEPt6TyPJFH2W9SBFrsQHr3ANSUDx_agoBAH_kBJgf2rPafNi3Gymbl1Y9ob936ZFAViwcKE2ho6AMyipqnfeD2Q6xy6isdIWOpV36ZvShZri_FF0fkzhr7ztkfsZAT1_bPmqfOUP";   

    let tripLayerView;

    //Set up Map and Mapview
    const map = new Map({
      basemap: "osm"
    });

    const view = new MapView({
      map: map,
      center: [-91.24025122550655, 43.798184326703314],
      zoom: 15, 
      container: "viewDiv", 
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
    toolsDiv.appendChild(basemapExpand.container);
    toolsDiv.appendChild(locateBtn.container);
    toolsDiv.appendChild(searchWidget.container);

    //Create Expand widget to hold tools
    const expandWidget = new Expand({
      view: view,
      content: toolsDiv,
      group: "top-left",
      expandIcon: "layers"
    });
    view.ui.add(expandWidget, "top-left");


    // Create featurelayer from feature service 
    const layer = new FeatureLayer({ 
      // URL to the service 
      url: "https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/survey123_2fd3abfee008406399dd31d9f4a9a07e_results/FeatureServer",
      outFields: ["*"],
      popupTemplate: {
        title: "{Trip Name}",
        content: getPopupContent
      }
    });
    map.add(layer);
    //Popup settings for mobile ease of use
    view.popup = {
      dockEnabled: false,  // Ensures popup is always undocked
      collapseEnabled: false, // Prevents collapsing
      dockOptions: {
        buttonEnabled: false, // Removes docking button
        breakpoint: false // Prevents auto-docking on mobile
      }
    };


    const optionNodes = document.querySelectorAll(`.options`);
    const tripNode = document.getElementById("trip_nameBtn");
    const yearNode = document.getElementById("date_visitedBtn");
    const userNode = document.getElementById("logged_byBtn");
    const filterElement = document.getElementById("parentFilterBtn");

    //Div to hold Locate Me, Search, and BasemapExpand
    const filtersDiv = document.createElement("div");
    filtersDiv.classList.add("esri-widget");
    filtersDiv.style.padding = "10px";

    const yearExpand = new Expand({
      view: view,
      content: yearNode,
      label: "Years",
      group: "filters"
    });

    const tripExpand = new Expand({
      view: view,
      content: tripNode,
      label: "Years",
      group: "filters"
    });

    const userExpand = new Expand({
      view: view,
      content: userNode,
      label: "Years",
      group: "filters"
    });

    view.ui.add(tripExpand);
    view.ui.add(userExpand);
    view.ui.add(yearExpand);

    filtersDiv.appendChild(tripExpand.container);
    filtersDiv.appendChild(userExpand.container);
    filtersDiv.appendChild(yearExpand.container);

    view.whenLayerView(layer).then((layerView) => {
      tripLayerView = layerView;
    
      //Set up UI
      filterElement.style.visibility = "visible";
      const mainFilterExpand = new Expand({
        view: view,
        content: filtersDiv,
        expandIcon: "filter",
        collapseIcon: "filter",
        group: "top-left"
      });
      view.ui.add(mainFilterExpand, "top-left");
    });
      
    //populateDropdowns(layer);


    //Populate dropdowns with distinct values from trip_name, logged_by, and year from date_visited
    function populateDropdowns(layer) {
      const fields = ["trip_name", "logged_by", "date_visited"];
      fields.forEach(field => {
        const query = layer.createQuery();
        query.returnDistinctValues = true;
        query.outFields = [field];
        layer.queryFeatures(query).then((result) => {
          const select = document.getElementById(`${field}Filter`);
          result.features.forEach(feature => {
            const value = feature.attributes[field];
            if(value) {
              const option = document.createElement("option");
              option.value = value;
              option.textContent = value;
              select.appendChild(option);
            }
          });
        });
      });
    }
    
    function applyFilters(layerView) {
      const trip = document.getElementById("trip_nameFilter").value;
      const loggedBy = document.getElementById("logged_byFilter").value;
      const yearVisited = document.getElementById("date_visitedFilter").value;

      let whereClause = [];
      if(trip) {
        whereClause.push(`trip_name = '${trip}'`);
      }
      if(loggedBy) {
        whereClause.push(`logged_by = '${logged_by}`);
      }
      if(yearVisited) {
        whereClause.push(`date_visited = '${yearVisited}`);
      }

      layerView.filter = {
        where: whereClause.length ? whereClause.join(" AND ") : "" 
      };
    }

  }
    
);

//Creates popup content
function getPopupContent(feature) {
  const attributes = feature.graphic.attributes;
  const objectId = attributes.objectid;
  const featureLayer = feature.graphic.layer;
  
  // Fetch attachments dynamically
  return featureLayer.queryAttachments({
    objectIds: [objectId]
  }).then(response => {
    const attachments = response[objectId];
    
    if (attachments && attachments.length > 0) {
      const imageUrl = attachments[0].url; // Get the first attached image
      return `
        <p><b>Attraction:</b> ${attributes.attraction_name}</p>
        <p><b>Visited on:</b> ${attributes.date_visited}</p>
        <p><b>Logged by:</b> ${attributes.logged_by}</p>
        <p><b>Description:</b> ${attributes.description}</p>
        <img src="${imageUrl}" style="max-width: 100%; height: auto;"/>
      `;
    } else {
      return `<p><b>Attraction:</b> ${attributes.attraction_name}</p>
        <p><b>Visited on:</b> ${attributes.date_visited}</p>
        <p><b>Logged by:</b> ${attributes.logged_by}</p>
        <p><b>Description:</b> ${attributes.description}</p>
        <p>No photo available.</p>`;
    }
  });
}


