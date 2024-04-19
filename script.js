// display variables
var displayMap;
let view;

function loadModule(moduleName) {
  return new Promise((resolve, reject) => {
    require([moduleName], (module) => {
      if (module) {
        resolve(module);
      } else {
        reject(new Error(`Module not found: ${moduleName}`));
      }
    }, (error) => {
      reject(error);
    });
  });
}

async function initializeMapPlannersWithNewFeatures() {
  try {
    const [esriConfig, Map, MapView, CSVLayer, FeatureReductionCluster, clusters, AggregateField, ExpressionInfo, Swipe] = await Promise.all([
      loadModule("esri/config"),
      loadModule("esri/Map"),
      loadModule("esri/views/MapView"),
      loadModule("esri/layers/CSVLayer"),
      loadModule("esri/layers/support/FeatureReductionCluster"),
      loadModule("esri/smartMapping/labels/clusters"),
      loadModule("esri/layers/support/AggregateField"),
      loadModule("esri/layers/support/ExpressionInfo"),
      loadModule("esri/widgets/Swipe"),
    ]);

    esriConfig.apiKey =
      "AAPK756f006de03e44d28710cb446c8dedb4rkQyhmzX6upFiYPzQT0HNQNMJ5qPyO1TnPDSPXT4EAM_DlQSj20ShRD7vyKa7a1H"; // Will change it

    // points to the states layer in a service storing U.S. census data
    const csvLayer = new CSVLayer({
      url: "https://raw.githubusercontent.com/ashrafayman219/CSVV/main/final.csv",
      copyright: "data",
      renderer: {
        type: "simple",
        symbol: {
          type: "picture-marker",
          url: "https://arcgis.github.io/arcgis-samples-javascript/sample-data/cat3.png",
          // color: "#69dcff",
          width: "30px",
          height: "30px"
        }
      },
      title: "Psychology Geodata",
      popupTemplate: {
        title: "{Name}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "addressLocality",
                label: "Address Locality",
              },
              {
                fieldName: "Country",
                label: "Country",
              },
              {
                fieldName: "Longitude",
                label: "Longitude",
              },
              {
                fieldName: "Latitude",
                label: "Latitude",
              },
              {
                fieldName: "max",
                label: "Max Price",
              },
              {
                fieldName: "average",
                label: "Average Price",
              },
              {
                fieldName: "postalCode",
                label: "Postal Code",
              },
            ],
          },
        ],
      },
    });

    // csvLayer.featureReduction.fields = [
    // {
    //     name: "AVG_age",
    //     onStatisticField: "average",
    //     statisticType: "avg"
    // }];


        // points to the states layer in a service storing U.S. census data
        const therapists = new CSVLayer({
          url: "https://raw.githubusercontent.com/ashrafayman219/CSVV/main/final%20xy%20coordinates%201.csv",
          copyright: "XY_Coordinates",
          renderer: {
            type: "simple", // autocasts as new SimpleRenderer()
            symbol: {
              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
              size: 7,
              color: "#69dcfg",
              outline: {
                color: "rgba(230, 185, 61, 0.5)",
                width: 7
              }
            }
          },
          title: "Therapists",
          popupTemplate: {
            title: "{Name}",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "addressLocality",
                    label: "Address Locality",
                  },
                  {
                    fieldName: "Country",
                    label: "Country",
                  },
                  {
                    fieldName: "Longitude",
                    label: "Longitude",
                  },
                  {
                    fieldName: "Latitude",
                    label: "Latitude",
                  },
                  {
                    fieldName: "max",
                    label: "Max Price",
                  },
                  {
                    fieldName: "average",
                    label: "Average Price",
                  },
                  {
                    fieldName: "postalCode",
                    label: "Postal Code",
                  },
                ],
              },
            ],
          },
        });


    displayMap = new Map({
      basemap: "satellite",
      layers: [csvLayer, therapists],
    });

    view = new MapView({
      center: [-74.05228789, 41.74044564], // longitude, latitude, centered on NY
      container: "displayMap",
      map: displayMap,
      zoom: 3,
      highlightOptions: {
        color: "#39ff14",
        haloOpacity: 0.9,
        fillOpacity: 0,
      },
    });

    var aggregateField = new AggregateField ({
      alias: "Average prices",
      name: "AVG_Price",
      onStatisticField: "average",
      statisticType: "avg"
    })

    // // will create an aggregate field for the Population field of the layer.
    // aggregateField.onStatisticExpression = new ExpressionInfo({
    //   title: "Pricessss",
    //   returnType: "number",
    //   expression: "$feature.average / $feature.cluster_count"
    // });



    function generateClusterConfig(csvLayer) {

      // Sets suggested labels on the clusters based on the underlying renderer
      clusters.getLabelSchemes({
        layer: csvLayer,
        view: view,
        field: "AVG_Price"
      }).then(function(labelSchemes){
        const featureReduction = csvLayer.featureReduction.clone();
        const { labelingInfo, clusterMinSize } = labelSchemes.primaryScheme;
        featureReduction.labelingInfo = labelingInfo;
        // featureReduction.clusterMinSize = clusterMinSize;

        csvLayer.featureReduction = featureReduction;
      }).catch(function(error){
        console.error(error);
      });


    }

    csvLayer
    .when()
    .then(generateClusterConfig)
    .then((featureReduction) => {

      csvLayer.featureReduction = {
        type: "cluster",
        clusterRadius: "200px",
        // clusterMinSize: 16.5,
        clusterMinSize: "44px",
        clusterMaxSize: "80px",
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: "#69dcff",
          outline: {
            color: "rgba(0, 139, 174, 0.5)",
            width: 10
          }
        },
        // defines the label within each cluster
        labelingInfo: [
          {
            deconflictionStrategy: "none",
            labelExpressionInfo: {
              expression: `
                // var countt = $feature.cluster_count;
                // var n = Expects($feature, "average")
  
                // // DefaultValue(Sum($feature, 'min') / cluster_count, 'no data')
  
                // var s = Sum($feature, 'cluster_avg_average')
                // Console(s)
                // return countt

                // return $feature.average
  
  
              `,
              title: "List of fuel types"
            },
            symbol: {
              type: "text",
              color: "#004a5d",
              font: {
                weight: "bold",
                family: "Noto Sans",
                size: "14px"
              }
            },
            labelPlacement: "center-center"
          }
        ],
        // information to display when the user clicks a cluster
        popupTemplate: {
          title: "Cluster Summary",
          content: "The number of features for this cluster is: <b>{cluster_count}</b>.",
          fieldInfos: [{
            // fieldName: "cluster_avg_average",
            // format: {
            //   places: 1,
            //   // digitSeparator: true
            // },
            fieldName: "cluster_count",
            format: {
              digitSeparator: true,
              places: 0
            }
          }]
        }
      };
  
      // You need to apply the aggregateField to your CSV layer
      csvLayer.featureReduction.fields = [aggregateField];


    })





    therapists.featureReduction = {
      type: "cluster",
      clusterRadius: "200px",
      // clusterMinSize: 16.5,
      clusterMinSize: "44px",
      clusterMaxSize: "80px",
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: "#69dcfg",
        outline: {
          color: "rgba(0, 139, 174, 0.5)",
          width: 10
        }
      },
      // defines the label within each cluster
      labelingInfo: [
        {
          deconflictionStrategy: "none",
          labelExpressionInfo: {
            expression: `
              var countt = $feature.cluster_count;
              // var n = Expects($feature, "average")

              // // DefaultValue(Sum($feature, 'min') / cluster_count, 'no data')

              // var s = Sum($feature, 'cluster_avg_average')
              // Console(s)
              // return countt

              return countt
            `,
            title: "List of fuel types"
          },
          symbol: {
            type: "text",
            color: "#004a5d",
            font: {
              weight: "bold",
              family: "Noto Sans",
              size: "14px"
            }
          },
          labelPlacement: "center-center"
        }
      ],
      // information to display when the user clicks a cluster
      popupTemplate: {
        title: "Cluster Summary",
        content: "The number of therapists for this cluster is: <b>{cluster_count}</b>.",
        fieldInfos: [{
          // fieldName: "cluster_avg_average",
          // format: {
          //   places: 1,
          //   // digitSeparator: true
          // },
          fieldName: "cluster_count",
          format: {
            digitSeparator: true,
            places: 0
          }
        }]
      }
    };


    let swipe = new Swipe({
      view: view,
      leadingLayers: [therapists],
      trailingLayers: [csvLayer],
      position: 50 // position set to middle of the view (50%)
    });
    view.ui.add(swipe);






























    await view.when();

    view.whenLayerView(therapists).then(function (layerView) {
      view.goTo(
        {
          target: therapists.fullExtent,
        },
        {
          duration: 2000,
        }
      );
    })



    //add widgets
    addWidgets()
      .then(([view, displayMap]) => {
        console.log(
          "Widgets Returned From Require Scope",
          view,
          displayMap,
          featureLayer
        );

        // You can work with the view object here
        clickToDownloadScreenshot();
      })
      .catch((error) => {
        // Handle any errors here
      });
    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

// calling
initializeMapPlannersWithNewFeatures()
  .then(() => {
    console.log("Map Returned From Require Scope", displayMap, view);
    // You can work with the view object here
  })
  .catch((error) => {
    // Handle any errors here
  });

async function addWidgets() {
  try {
    // await initializeMap();

    const [
      Fullscreen,
      BasemapGallery,
      Expand,
      ScaleBar,
      AreaMeasurement2D,
      Search,
      Home,
      LayerList,
    ] = await Promise.all([
      loadModule("esri/widgets/Fullscreen"),
      loadModule("esri/widgets/BasemapGallery"),
      loadModule("esri/widgets/Expand"),
      loadModule("esri/widgets/ScaleBar"),
      loadModule("esri/widgets/AreaMeasurement2D"),
      loadModule("esri/widgets/Search"),
      loadModule("esri/widgets/Home"),
      loadModule("esri/widgets/LayerList"),
    ]);

    var basemapGallery = new BasemapGallery({
      view: view,
    });

    var Expand22 = new Expand({
      view: view,
      content: basemapGallery,
      expandIcon: "basemap",
      group: "top-right",
      // expanded: false,
      expandTooltip: "Open Basmap Gallery",
      collapseTooltip: "Close",
    });
    view.ui.add([Expand22], { position: "top-right", index: 6 });

    var fullscreen = new Fullscreen({
      view: view,
    });
    view.ui.add(fullscreen, "top-right");

    var scalebar = new ScaleBar({
      view: view,
      unit: "metric",
    });
    view.ui.add(scalebar, "bottom-right");

    var search = new Search({
      //Add Search widget
      view: view,
    });
    view.ui.add(search, { position: "top-left", index: 0 }); //Add to the map

    var homeWidget = new Home({
      view: view,
    });
    view.ui.add(homeWidget, "top-left");

    var layerList = new LayerList({
      view: view,
      // listItemCreatedFunction: function (event) {
      //   var item = event.item;
      //   // displays the legend for each layer list item
      //   item.panel = {
      //     content: "legend",
      //   };
      // },
      // showLegend: true
    });
    layerList.visibilityAppearance = "checkbox";
    var Expand5 = new Expand({
      view: view,
      content: layerList,
      expandIcon: "layers",
      group: "top-right",
      // expanded: false,
      expandTooltip: "Layer List",
      collapseTooltip: "Close",
    });

    view.ui.add([Expand5], { position: "top-left", index: 6 });
    view.ui.add("controlsWidget", "top-right");

    await view.when();

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

async function clickToDownloadScreenshot() {
  try {
    console.log("Hi in Screenshot function...");

    document
      .getElementById("takeScreenshotButton")
      .addEventListener("click", () => {
        view.takeScreenshot().then((screenshot) => {
          downloadImage("screenshot.png", screenshot.dataUrl);
        });
      });

    // helper function directly from
    // https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=sceneview-screenshot
    function downloadImage(filename, dataUrl) {
      // the download is handled differently in Microsoft browsers
      // because the download attribute for <a> elements is not supported
      if (!window.navigator.msSaveOrOpenBlob) {
        // in browsers that support the download attribute
        // a link is created and a programmatic click will trigger the download
        const element = document.createElement("a");
        element.setAttribute("href", dataUrl);
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else {
        // for MS browsers convert dataUrl to Blob
        const byteString = atob(dataUrl.split(",")[1]);
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });

        // download file
        window.navigator.msSaveOrOpenBlob(blob, filename);
      }
    }

    await view.when();

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}
