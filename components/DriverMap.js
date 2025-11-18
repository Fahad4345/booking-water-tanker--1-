// import React, { useRef, useEffect, useState } from "react";
// import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
// import { WebView } from "react-native-webview";

// const RouteMap = ({ currentLocation, destination }) => {
//   const webviewRef = useRef(null);
//   const [isWebViewReady, setIsWebViewReady] = useState(false);
//   const [loading, setLoading] = useState(true);


//   useEffect(() => {
//     if (isWebViewReady && currentLocation && destination) {
//       console.log("📍 Sending route data:", { currentLocation, destination });
//       sendRouteToMap();
//       setLoading(false);
//     }
//   }, [isWebViewReady, currentLocation, destination]);

//   const sendRouteToMap = () => {
//     try {
//       if (webviewRef.current && webviewRef.current.postMessage) {
//         webviewRef.current.postMessage(JSON.stringify({
//           type: "SHOW_ROUTE",
//           startLat: currentLocation.lat,
//           startLng: currentLocation.lng,
//           endLat: destination.lat,
//           endLng: destination.lng
//         }));
//       }
//     } catch (e) {
//       console.error("Error sending route to map:", e);
//     }
//   };

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//       <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//       <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
//       <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
//       <style>
//         html, body, #map { 
//           height: 100%; 
//           margin: 0; 
//           padding: 0; 
//         }
        
//         /* Hide ALL controls */
//         .leaflet-control-attribution,
//         .leaflet-control-zoom,
//         .leaflet-control-scale,
//         .leaflet-routing-container {
//           display: none !important;
//         }
        
//         /* Custom marker styles */
//         .start-marker {
//           background: #4285F4;
//           border: 3px solid white;
//           border-radius: 50%;
//           width: 16px;
//           height: 16px;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//         }
        
//         .end-marker {
//           background: #EA4335;
//           border: 3px solid white;
//           border-radius: 50%;
//           width: 16px;
//           height: 16px;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.3);
//         }
        
//         .loading-overlay {
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           background: rgba(255, 255, 255, 0.9);
//           padding: 12px 16px;
//           border-radius: 8px;
//           z-index: 1000;
//           font-size: 14px;
//           font-weight: 500;
//           color: #333;
//         }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <div id="loadingOverlay" class="loading-overlay" style="display: none;">Calculating route...</div>
      
//       <script>
//         // Initialize map with ALL controls disabled
//         var map = L.map('map', { 
//           zoomControl: true,           // Disable zoom buttons
//           dragging: true,               // Keep dragging enabled
//           scrollWheelZoom: false,       // Disable scroll zoom
//           doubleClickZoom: false,       // Disable double click zoom
//           boxZoom:  true,               // Disable box zoom
//           keyboard: false,              // Disable keyboard navigation
//           touchZoom: true              // Disable touch zoom
//         });
        
//         // Add tile layer
//         L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//           maxZoom: 19,
//           attribution: ''  // Remove attribution
//         }).addTo(map);
        
//         var routingControl = null;
//         var startMarker = null;
//         var endMarker = null;

//         function showRoute(startLat, startLng, endLat, endLng) {
//           console.log('Calculating route from:', startLat, startLng, 'to:', endLat, endLng);
          
//           // Show loading
//           document.getElementById('loadingOverlay').style.display = 'block';
          
//           // Remove previous route and markers
//           if (routingControl) {
//             map.removeControl(routingControl);
//           }
//           if (startMarker) map.removeLayer(startMarker);
//           if (endMarker) map.removeLayer(endMarker);

//           // Add custom markers
//           startMarker = L.marker([startLat, startLng], {
//             icon: L.divIcon({
//               className: 'start-marker',
//               iconSize: [16, 16],
//               iconAnchor: [8, 8]
//             })
//           }).bindPopup("Your Location").addTo(map);

//           endMarker = L.marker([endLat, endLng], {
//             icon: L.divIcon({
//               className: 'end-marker',
//               iconSize: [16, 16],
//               iconAnchor: [8, 8]
//             })
//           }).bindPopup("Delivery Location").addTo(map);

//           // Create routing control with OSRM
//           routingControl = L.Routing.control({
//             waypoints: [
//               L.latLng(startLat, startLng),
//               L.latLng(endLat, endLng)
//             ],
//             routeWhileDragging: false,
//             showAlternatives: false,
//             fitSelectedRoutes: true,
//             show: false, // Hide the default routing panel
//             createMarker: function() { return null; }, // Don't create default markers
//             lineOptions: {
//               styles: [
//                 {
//                   color: '#4FC3F7',
//                   weight: 6,
//                   opacity: 0.8
//                 }
//               ],
//               missingRouteTolerance: 0
//             },
//             router: L.Routing.osrmv1({
//               serviceUrl: 'https://router.project-osrm.org/route/v1',
//               profile: 'driving'
//             })
//           }).addTo(map);

//           // Listen for route found event
//           routingControl.on('routesfound', function(e) {
//             console.log('Route found!');
//             document.getElementById('loadingOverlay').style.display = 'none';
            
//             // Fit map to show the entire route (no distance display)
//             var bounds = L.latLngBounds([
//               [startLat, startLng],
//               [endLat, endLng]
//             ]);
//             map.fitBounds(bounds, { padding: [50, 50] });
//           });

//           // Handle routing errors
//           routingControl.on('routingerror', function(e) {
//             console.error('Routing error:', e.error);
//             document.getElementById('loadingOverlay').style.display = 'none';
            
//             // Fallback: show straight line if routing fails
//             showFallbackRoute(startLat, startLng, endLat, endLng);
//           });
//         }

//         function showFallbackRoute(startLat, startLng, endLat, endLng) {
//           // Create a simple polyline as fallback
//           var fallbackRoute = L.polyline([
//             [startLat, startLng],
//             [endLat, endLng]
//           ], {
//             color: '#4FC3F7',
//             weight: 5,
//             opacity: 0.7,
//             dashArray: '10, 10'
//           }).addTo(map);
          
//           // Fit map (no distance display)
//           var bounds = L.latLngBounds([
//             [startLat, startLng],
//             [endLat, endLng]
//           ]);
//           map.fitBounds(bounds, { padding: [50, 50] });
//         }

//         function handleMessage(data) {
//           if (data && data.type === "SHOW_ROUTE") {
//             showRoute(data.startLat, data.startLng, data.endLat, data.endLng);
//           }
//         }

//         // Listen for messages
//         document.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });
        
//         window.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });

//         // Notify React Native that WebView is ready
//         window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
//       </script>
//     </body>
//     </html>
//   `;

//   if (!currentLocation || !destination) {
//     return (
//       <View style={[styles.container, styles.centered]}>
//         <ActivityIndicator size="large" color="#4FC3F7" />
//         <Text style={styles.loadingText}>Getting locations...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webviewRef}
//         originWhitelist={["*"]}
//         source={{ html }}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         onMessage={(event) => {
//           try {
//             const data = JSON.parse(event.nativeEvent.data);
//             if (data.type === "WEBVIEW_READY") {
//               setIsWebViewReady(true);
//             }
//           } catch (error) {
//             console.error("Error handling WebView message:", error);
//           }
//         }}
//         style={styles.webview}
//       />
      
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="small" color="#4FC3F7" />
//           <Text style={styles.loadingOverlayText}>Loading route...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   centered: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   webview: {
//     flex: 1,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#666',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   loadingOverlayText: {
//     fontSize: 12,
//     color: '#333',
//     fontWeight: '500',
//   },
// });

// export default RouteMap;

import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

const RouteMap = ({ currentLocation, destination, tankerLocation }) => {
  const webviewRef = useRef(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isWebViewReady && currentLocation && destination) {
      console.log("📍 Sending route data:", { 
        currentLocation, 
        destination, 
        tankerLocation 
      });
      sendRouteToMap();
      setLoading(false);
    }
  }, [isWebViewReady, currentLocation, destination, tankerLocation]);

  const sendRouteToMap = () => {
    try {
      if (webviewRef.current && webviewRef.current.postMessage) {
        // Use tankerLocation if available, otherwise use currentLocation for the tanker
        const tankerCoords = tankerLocation || currentLocation;
        
        const message = {
          type: "SHOW_ROUTE",
          startLat: currentLocation.lat,
          startLng: currentLocation.lng,
          endLat: destination.lat,
          endLng: destination.lng,
          tankerLat: tankerCoords.lat,
          tankerLng: tankerCoords.lng
        };
        
        console.log("📨 Sending route with tanker:", message);
        webviewRef.current.postMessage(JSON.stringify(message));
      }
    } catch (e) {
      console.error("Error sending route to map:", e);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
      <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
      <style>
        html, body, #map { 
          height: 100%; 
          margin: 0; 
          padding: 0; 
        }
        
        /* Hide ALL controls */
        .leaflet-control-attribution,
        .leaflet-control-zoom,
        .leaflet-control-scale,
        .leaflet-routing-container {
          display: none !important;
        }
        
        /* Custom marker styles */
        .start-marker {
          background: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .end-marker {
          background: #EA4335;
          border: 3px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
     
      
      <script>
        // Initialize map
        var map = L.map('map', { 
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: true,
          keyboard: false,
          touchZoom: true
        });
        
        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: ''
        }).addTo(map);
        
        var routingControl = null;
        var startMarker = null;
        var endMarker = null;
        var tankerMarker = null;

        function showRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng) {
          // Show loading
          
          
          // Remove previous route and markers
         
          if (startMarker) map.removeLayer(startMarker);
          if (endMarker) map.removeLayer(endMarker);
          if (tankerMarker) map.removeLayer(tankerMarker);

          // Add START marker (Blue) - Your Location
          startMarker = L.marker([startLat, startLng], {
            icon: L.divIcon({
              className: 'start-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).bindPopup("📍 Your Location").addTo(map);

          // Add END marker (Red) - Delivery Location
          endMarker = L.marker([endLat, endLng], {
            icon: L.divIcon({
              className: 'end-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).bindPopup("🎯 Delivery Location").addTo(map);

          // Add TANKER marker (Green) - Tanker Location
          tankerMarker = L.marker([tankerLat, tankerLng], {
            icon: L.divIcon({
              html: '<div style="background: #34A853; border: 3px solid white; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            }),
            zIndexOffset: 1000
          }).bindPopup("🚛 Tanker Location").addTo(map);

          // Create routing control with OSRM
          routingControl = L.Routing.control({
            waypoints: [
              L.latLng(startLat, startLng),
              L.latLng(endLat, endLng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: false,
            show: false,
            createMarker: function() { return null; },
            lineOptions: {
              styles: [
                {
                  color: '#4FC3F7',
                  weight: 6,
                  opacity: 0.8
                }
              ],
              missingRouteTolerance: 0
            },
            router: L.Routing.osrmv1({
              serviceUrl: 'https://router.project-osrm.org/route/v1',
              profile: 'driving'
            })
          }).addTo(map);

          // Listen for route found event
          routingControl.on('routesfound', function(e) {
           
            
            // Create bounds to include all points
            var bounds = L.latLngBounds([
              [startLat, startLng],
              [endLat, endLng],
              [tankerLat, tankerLng]
            ]);
            
            map.fitBounds(bounds, { padding: [50, 50] });
          });

          // Handle routing errors
          routingControl.on('routingerror', function(e) {
           
            // Fallback: show straight line if routing fails
            showFallbackRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng);
          });
        }

        function showFallbackRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng) {
          // Create a simple polyline as fallback
          var fallbackRoute = L.polyline([
            [startLat, startLng],
            [endLat, endLng]
          ], {
            color: '#4FC3F7',
            weight: 5,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);
          
          // Create bounds to include all points
          var bounds = L.latLngBounds([
            [startLat, startLng],
            [endLat, endLng],
            [tankerLat, tankerLng]
          ]);
          
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        function handleMessage(data) {
          if (!data) return;
          
          if (data.type === "SHOW_ROUTE") {
            if (data.tankerLat && data.tankerLng) {
              showRoute(
                data.startLat, 
                data.startLng, 
                data.endLat, 
                data.endLng,
                data.tankerLat,
                data.tankerLng
              );
            }
          }
        }

        // Listen for messages
        document.addEventListener('message', function(e) {
          try { 
            var data = JSON.parse(e.data);
            handleMessage(data); 
          } catch(err) { 
            console.error('Error parsing message:', err); 
          }
        });
        
        window.addEventListener('message', function(e) {
          try { 
            var data = JSON.parse(e.data);
            handleMessage(data); 
          } catch(err) { 
            console.error('Error parsing window message:', err); 
          }
        });

        // Set default view
        map.setView([33.6588, 73.0709], 10);

        // Notify React Native that WebView is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
      </script>
    </body>
    </html>
  `;

  if (!currentLocation || !destination) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={styles.loadingText}>Getting locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "WEBVIEW_READY") {
              setIsWebViewReady(true);
            }
          } catch (error) {
            console.error("Error handling WebView message:", error);
          }
        }}
        onError={(error) => console.error("WebView error:", error)}
        onLoadEnd={() => console.log("WebView load completed")}
        style={styles.webview}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#4FC3F7" />
          <Text style={styles.loadingOverlayText}>Loading route...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingOverlayText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default RouteMap;