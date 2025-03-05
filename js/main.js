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
    "esri/views/layers/FeatureLayerView"

  ], 
  function(esriConfig, Map, MapView, Locate, Search, BasemapGallery, Expand, FeatureLayer, FeatureFilter) {
    esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurFOkIusOF1VpY7XrI8On8rT97tNiNbtgFmCtwOvhjfFhOLXkYP94N4hIcMdSHeUciUtB2IWQ_2YVJSdXzi_IWhmWdynaqt-VAFxx-m7QPXP1DZmxEPt6TyPJFH2W9SBFrsQHr3ANSUDx_agoBAH_kBJgf2rPafNi3Gymbl1Y9ob936ZFAViwcKE2ho6AMyipqnfeD2Q6xy6isdIWOpV36ZvShZri_FF0fkzhr7ztkfsZAT1_bPmqfOUP";   

    let tripLayerView;

  //----------------------------------------------------------------------------------------------
  /**
   * Setting up basic map elements and widgets
   */

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
      expandIcon: "layers",
      collapseIcon: "layers"
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

//----------------------------------------------------------------------------------------------
/**
 * Here begins setting up filters for the FeatureLayer data
 */

    //Divs for each attribute to be filtered by
    const tripNode = document.getElementById("trip_nameBtn");
    const yearNode = document.getElementById("date_visitedBtn");
    const userNode = document.getElementById("logged_byBtn");
    const filterElement = document.getElementById("parentFilterBtn");

    //Div to hold Expand for each filter
    const filtersDiv = document.createElement("div");
    filtersDiv.classList.add("esri-widget");
    filtersDiv.style.padding = "10px";

    //Will become Year filter
    const yearExpand = new Expand({
      view: view,
      content: yearNode,
      expandIcon: "calendar",
      collapseIcon: "calendar",
      group: "filters"
    });

    //Will become Trip filter
    const tripExpand = new Expand({
      view: view,
      content: tripNode,
      expandIcon: "car",
      collapseIcon: "car",
      group: "filters"
    });

    //Will become User filter
    const userExpand = new Expand({
      view: view,
      content: userNode,
      expandIcon: "user",
      collapseIcon: "user",
      group: "filters"
    });

    //Add filters to filter div
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

      populateDropdowns(layer);
    });
      


    //Put distinct values in the appropriate filter categories
    function populateDropdowns(layer) {
      const fieldMappings = {
        "trip_name": "trip_nameBtn",
        "logged_by": "logged_byBtn",
        "date_visited": "date_visitedBtn"
      };
    
      Object.keys(fieldMappings).forEach(field => {
        const query = layer.createQuery();
        query.returnDistinctValues = true;
    
        if (field === "date_visited") {
          query.outFields = ["date_visited"];
        } else {
          query.outFields = [field];
        }
        
        layer.queryFeatures(query).then((result) => {
          const container = document.getElementById(fieldMappings[field]);
          console.log(fieldMappings[field]);
          container.innerHTML = ""; 
    
          const uniqueValues = new Set();
    
          result.features.forEach(feature => {
            let value = feature.attributes[field];
            if (value) {
              if (field === "date_visited") {
                value = value.split("/")[2]; // Extract only the year
              }
              uniqueValues.add(value);
            }
          });
    
          // Sort values and add as clickable divs
          Array.from(uniqueValues).sort().forEach(value => {
            const optionDiv = document.createElement("div");
            optionDiv.classList.add("optionItem", "esri-widget");
            optionDiv.textContent = value;
            optionDiv.dataset.value = value;
            container.appendChild(optionDiv);
          });
        });
      });
    }

    //Store selected values for each filter category
    const selectedFilters = {
      trip_name: null,
      logged_by: null,
      date_visited: null
    };

    //Event listeners
    tripNode.addEventListener("click", filterAttribute);
    userNode.addEventListener("click", filterAttribute);
    yearNode.addEventListener("click", filterAttribute);

    function filterAttribute(event) {
      const fieldMappings = {
        trip_nameBtn: "trip_name",
        logged_byBtn: "logged_by",
        date_visitedBtn: "date_visited"
      };

      const clickedElement = event.target;
      //Identify which category was clicked
      const parentId = clickedElement.parentElement.id;
      const field = fieldMappings[parentId];

      //If field is not recognized do nothing
      if(!field) {
        console.log(field);
        return
      }

      const selectedValue = clickedElement.getAttribute("data-value");

      //Toggle selection - if already selected, deselect it
      if(selectedFilters[field] === selectedValue) {
        selectedFilters[field] = null
        clickedElement.classList.remove("selectedFilter");
      }
      else {
        //Update selected filter
        selectedFilters[field] = selectedValue;

        //Remove selected style from other options in same attribute category
        clickedElement.parentElement.querySelectorAll(".optionItem").forEach(option => {
          option.classList.remove("selectedFilter");
        });
        clickedElement.classList.add("selectedFilter");
      }



      //Apply filter to map layer
      applyFilters();
    }

    function applyFilters() {
      let whereClauses = [];

      //Build SQL queries for each filter
      Object.keys(selectedFilters).forEach(field => {
        const value = selectedFilters[field];
        if(value) {
          if(field === "date_visited") {
            //Checks if year is in date given by user (is in mm/dd/yyyy) not yyyy
            console.log(field);
            console.log(typeof(value));
            whereClauses.push(`${field} LIKE '%${value}%'`);
          } 
          else {
            whereClauses.push(`${field} = '${value}'`);
          }

        }
      });

      const whereClause = whereClauses.length > 0 ? whereClauses.join(" AND ") : "1=1";

      //Apply filter
      tripLayerView.filter = {
        where: whereClause
      };
      console.log(tripLayerView.filter.where);
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


