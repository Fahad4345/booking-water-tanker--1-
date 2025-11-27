// import React, { useRef, useEffect, useState } from "react";
// import { View, StyleSheet, Text } from "react-native";
// import { WebView } from "react-native-webview";
// import * as Location from "expo-location";

// export default function ReadOnlyMap({ 
//   tankerLocation = null,
//   address = "Waiting for tanker...",
//   showTankerTracking = true 
  
// }) {
//   const webviewRef = useRef(null);
//   const [isWebViewReady, setIsWebViewReady] = useState(false);
//   const tankerPathRef = useRef([]);
//   const destinationCoordsRef = useRef(null);

//   const postToWebView = (obj) => {
//     try {
//       if (webviewRef.current && isWebViewReady) {
//         webviewRef.current.postMessage(JSON.stringify(obj));
//       }
//     } catch (e) {
//       console.error("postToWebView error:", e);
//     }
//   };

//   // Handle tanker location updates - FIXED: Accumulate path properly
//   useEffect(() => {
//     if (tankerLocation && isWebViewReady && showTankerTracking) {
//       console.log("📍 Updating tanker location on map:", tankerLocation);
      
//       // Only add if it's a new position (avoid duplicates)
//       const lastPoint = tankerPathRef.current[tankerPathRef.current.length - 1];
//       if (!lastPoint || lastPoint.lat !== tankerLocation.lat || lastPoint.lng !== tankerLocation.lng) {
//         tankerPathRef.current = [...tankerPathRef.current, tankerLocation].slice(-100);
//       }
      
//       postToWebView({
//         type: "UPDATE_TANKER_LOCATION",
//         lat: tankerLocation.lat,
//         lng: tankerLocation.lng,
//         path: tankerPathRef.current,
//         destination: destinationCoordsRef.current
//       });
//     }
//   }, [tankerLocation, isWebViewReady, showTankerTracking]);

//   // Geocode address and move to location
//   useEffect(() => {
//     if (address && isWebViewReady) {
//       const coordMatch = address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/);
      
//       if (coordMatch) {
//         const [latStr, lngStr] = address.split(",").map((s) => s.trim());
//         const destination = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
//         destinationCoordsRef.current = destination;
        
//         postToWebView({
//           type: "MOVE_TO",
//           lat: destination.lat,
//           lng: destination.lng,
//           destination: destination
//         });
//       } else {
//         geocodeAddress(address);
//       }
//     }
//   }, [address, isWebViewReady]);

//   const geocodeAddress = async (addressString) => {
//     try {
//       const results = await Location.geocodeAsync(addressString);

//       if (results && results.length > 0) {
//         const { latitude, longitude } = results[0];
//         const destination = { lat: latitude, lng: longitude };
//         destinationCoordsRef.current = destination;
        
//         postToWebView({
//           type: "MOVE_TO",
//           lat: latitude,
//           lng: longitude,
//           destination: destination
//         });
//       } else {
//         const destination = { lat: 33.6844, lng: 73.0479 };
//         destinationCoordsRef.current = destination;
//         postToWebView({ type: "MOVE_TO", ...destination, destination });
//       }
//     } catch (error) {
//       console.error("📍 Error geocoding address:", error);
//       const destination = { lat: 33.6844, lng: 73.0479 };
//       destinationCoordsRef.current = destination;
//       postToWebView({ type: "MOVE_TO", ...destination, destination });
//     }
//   };

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//       <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//       <style>
//         html, body, #map { 
//           height: 100%; 
//           width: 100%;
//           margin: 0; 
//           padding: 0; 
//           overflow: hidden;
//         }
//         .leaflet-control-attribution { display: none !important; }
        
//         /* Tanker truck icon container */
//         .tanker-marker {
//           position: relative;
//         }
        
//         .tanker-marker::before {
//           content: '';
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           width: 50px;
//           height: 50px;
//           background: rgba(255, 87, 34, 0.3);
//           border-radius: 50%;
//           animation: ripple 2s ease-out infinite;
//         }
        
//         @keyframes ripple {
//           0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
//           100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
//         }
        
//         .destination-icon {
//           background-color: #4CAF50;
//           width: 24px;
//           height: 24px;
//           border-radius: 50%;
//           border: 3px solid white;
//           box-shadow: 0 2px 10px rgba(76,175,80,0.5);
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
        
//         .destination-icon::after {
//           content: '📍';
//           font-size: 12px;
//         }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <script>
//         var map = L.map('map', { 
//           zoomControl: false,
//           dragging: true,
//           scrollWheelZoom: true,
//           doubleClickZoom: true
//         }).setView([33.6844, 73.0479], 13);

//         L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//           maxZoom: 19
//         }).addTo(map);

//         var tankerMarker = null;
//         var destinationMarker = null;
//         var traveledPath = null;
//         var routePath = null;
        
//         // Store all path points persistently in WebView
//         var allPathPoints = [];

//         // SVG Tanker Truck Icon
//         function createTankerIcon() {
//           var svgIcon = \`
//             <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
//               <!-- Shadow -->
//               <ellipse cx="24" cy="44" rx="16" ry="3" fill="rgba(0,0,0,0.2)"/>
              
//               <!-- Tanker body (cylinder) -->
//               <rect x="8" y="18" width="28" height="14" rx="7" fill="#1976D2"/>
//               <rect x="8" y="18" width="28" height="7" rx="3" fill="#2196F3"/>
              
//               <!-- Tanker highlights -->
//               <rect x="10" y="20" width="24" height="2" rx="1" fill="#64B5F6" opacity="0.6"/>
              
//               <!-- Cab -->
//               <rect x="32" y="16" width="10" height="16" rx="2" fill="#FF5722"/>
//               <rect x="34" y="18" width="6" height="5" rx="1" fill="#87CEEB"/>
              
//               <!-- Wheels -->
//               <circle cx="14" cy="34" r="4" fill="#333"/>
//               <circle cx="14" cy="34" r="2" fill="#666"/>
//               <circle cx="28" cy="34" r="4" fill="#333"/>
//               <circle cx="28" cy="34" r="2" fill="#666"/>
//               <circle cx="38" cy="34" r="4" fill="#333"/>
//               <circle cx="38" cy="34" r="2" fill="#666"/>
              
//               <!-- Water drop icon on tanker -->
//               <path d="M20 22 Q20 26 22 28 Q24 30 24 26 Q24 22 22 20 Q20 18 20 22" fill="#E3F2FD"/>
              
//               <!-- Pulsing indicator -->
//               <circle cx="24" cy="10" r="6" fill="#FF5722">
//                 <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite"/>
//                 <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite"/>
//               </circle>
//               <circle cx="24" cy="10" r="3" fill="white"/>
//             </svg>
//           \`;
          
//           return L.divIcon({
//             className: 'tanker-marker',
//             html: svgIcon,
//             iconSize: [48, 48],
//             iconAnchor: [24, 34] // Anchor at the wheels
//           });
//         }

//         function createDestinationIcon() {
//           var svgIcon = \`
//             <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
//               <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 S32 28 32 16 C32 7.16 24.84 0 16 0Z" fill="#4CAF50"/>
//               <circle cx="16" cy="16" r="8" fill="white"/>
//               <circle cx="16" cy="16" r="4" fill="#4CAF50"/>
//             </svg>
//           \`;
          
//           return L.divIcon({
//             className: '',
//             html: svgIcon,
//             iconSize: [32, 40],
//             iconAnchor: [16, 40] // Anchor at pin point
//           });
//         }

//         function moveTo(lat, lng, destination) {
//           try {
//             console.log('📍 Moving map to:', lat, lng);
            
//             if (destinationMarker) map.removeLayer(destinationMarker);
            
//             destinationMarker = L.marker([destination.lat, destination.lng], { 
//               icon: createDestinationIcon(),
//               zIndexOffset: 500
//             }).addTo(map).bindPopup("<b>📍 Destination</b>");
            
//             map.setView([lat, lng], 15);
            
//           } catch(e) {
//             console.error('moveTo error', e);
//           }
//         }

//         async function getOSRMRoute(startLat, startLng, endLat, endLng) {
//           try {
//             var url = 'https://router.project-osrm.org/route/v1/driving/' + startLng + ',' + startLat + ';' + endLng + ',' + endLat + '?overview=full&geometries=geojson';
//             var response = await fetch(url);
//             var data = await response.json();
            
//             if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
//               return data.routes[0].geometry.coordinates.map(function(coord) {
//                 return [coord[1], coord[0]];
//               });
//             }
//             return null;
//           } catch (error) {
//             console.error('OSRM error:', error);
//             return null;
//           }
//         }

//         // FIXED: Persist traveled path across updates
//         async function updateTankerLocation(lat, lng, path, destination) {
//           console.log('📍 WebView: Updating tanker to:', lat, lng);
          
//           if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
//             console.error('📍 Invalid coordinates:', lat, lng);
//             return;
//           }
          
//           // FIXED: Merge incoming path with stored path (avoid duplicates)
//           if (path && path.length > 0) {
//             path.forEach(function(point) {
//               var isDuplicate = allPathPoints.some(function(p) {
//                 return p.lat === point.lat && p.lng === point.lng;
//               });
//               if (!isDuplicate) {
//                 allPathPoints.push(point);
//               }
//             });
//             // Keep last 200 points to prevent memory issues
//             if (allPathPoints.length > 200) {
//               allPathPoints = allPathPoints.slice(-200);
//             }
//           }
          
//           // Remove old tanker marker
//           if (tankerMarker) {
//             map.removeLayer(tankerMarker);
//             tankerMarker = null;
//           }
          
//           // Create tanker marker with truck icon
//           try {
//             tankerMarker = L.marker([lat, lng], { 
//               icon: createTankerIcon(),
//               zIndexOffset: 1000
//             }).addTo(map);
            
//             tankerMarker.bindPopup('<b>🚛 Water Tanker</b><br>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6));
            
//             console.log('📍 Tanker marker added at:', lat, lng);
//           } catch (e) {
//             console.error('📍 Error creating tanker marker:', e);
//             return;
//           }
          
//           // FIXED: Draw traveled path using ALL stored points
//           if (allPathPoints.length > 1) {
//             if (traveledPath) map.removeLayer(traveledPath);
            
//             var coords = allPathPoints.map(function(p) { return [p.lat, p.lng]; });
            
//             traveledPath = L.polyline(coords, {
//               color: '#FF5722',
//               weight: 5,
//               opacity: 0.85,
//               lineJoin: 'round',
//               lineCap: 'round'
//             }).addTo(map);
            
//             console.log('📍 Traveled path drawn with', allPathPoints.length, 'points');
//           }
          
//           // Draw remaining route to destination (blue dashed line)
//           if (destination && destination.lat && destination.lng) {
//             if (routePath) map.removeLayer(routePath);
            
//             var routeCoords = await getOSRMRoute(lat, lng, destination.lat, destination.lng);
            
//             if (routeCoords) {
//               routePath = L.polyline(routeCoords, {
//                 color: '#2196F3',
//                 weight: 4,
//                 opacity: 0.7,
//                 dashArray: '10, 8'
//               }).addTo(map);
//             } else {
//               routePath = L.polyline([[lat, lng], [destination.lat, destination.lng]], {
//                 color: '#2196F3',
//                 weight: 3,
//                 opacity: 0.6,
//                 dashArray: '10, 10'
//               }).addTo(map);
//             }
//           }
          
//           // Center map on tanker
//           map.setView([lat, lng], map.getZoom(), { animate: true });
          
//           setTimeout(function() {
//             map.invalidateSize();
//           }, 100);
//         }

//         function handleMessage(data) {
//           try {
//             if (!data || !data.type) return;
//             console.log('📍 Handling:', data.type);

//             if (data.type === "MOVE_TO") {
//               moveTo(data.lat, data.lng, data.destination);
//             } else if (data.type === "UPDATE_TANKER_LOCATION") {
//               updateTankerLocation(data.lat, data.lng, data.path, data.destination);
//             } else if (data.type === "CLEAR_PATH") {
//               // Optional: Clear the path if needed
//               allPathPoints = [];
//               if (traveledPath) {
//                 map.removeLayer(traveledPath);
//                 traveledPath = null;
//               }
//             }
//           } catch (e) {
//             console.error('📍 handleMessage error', e);
//           }
//         }

//         document.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });
//         window.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });

//         setTimeout(function() {
//           map.invalidateSize();
//           if (window.ReactNativeWebView) {
//             window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
//           }
//         }, 500);
//       </script>
//     </body>
//     </html>
//   `;

//   // Function to clear path (can be called from parent component)
//   const clearTankerPath = () => {
//     tankerPathRef.current = [];
//     postToWebView({ type: "CLEAR_PATH" });
//   };

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webviewRef}
//         originWhitelist={["*"]}
//         source={{ html }}
//         javaScriptEnabled
//         domStorageEnabled
//         onMessage={(event) => {
//           try {
//             const data = JSON.parse(event.nativeEvent.data);
//             if (data.type === "WEBVIEW_READY") {
//               console.log("📍 WebView ready");
//               setIsWebViewReady(true);
//             }
//           } catch (error) {
//             console.error("Message error:", error);
//           }
//         }}
//         onError={(e) => console.error('WebView error:', e)}
//       />
      
//       {showTankerTracking && (
//         <View style={styles.trackingStatus}>
//           <Text style={styles.trackingText}>
//             {tankerLocation ? "🚛 Live Tracking" : "⏳ Waiting for tanker..." }
//           </Text>
//           {tankerLocation && (
//             <Text style={styles.trackingText}>
//               On the Way
//             </Text>
//           )}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   trackingStatus: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: 'rgba(33, 150, 243, 0.95)',
//     padding: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   trackingText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   coordinatesText: {
//     color: 'rgba(255,255,255,0.9)',
//     fontSize: 11,
//     marginLeft: 8,
//   },
// });


import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

export default function ReadOnlyMap({ 
  tankerLocation = null,
  address = "Waiting for tanker...",
  showTankerTracking = true,
  isLiveTracking = false 
}) {
  const webviewRef = useRef(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const tankerPathRef = useRef([]);
  const destinationCoordsRef = useRef(null);

  const postToWebView = (obj) => {
    try {
      if (webviewRef.current && isWebViewReady) {
        webviewRef.current.postMessage(JSON.stringify(obj));
      }
    } catch (e) {
      console.error("postToWebView error:", e);
    }
  };

  useEffect(() => {
    if (isWebViewReady) {
      console.log("📍 Sending tracking status to WebView:", isLiveTracking);
      
      postToWebView({
        type: "TRACKING_STATUS",
        isLiveTracking: isLiveTracking,
        tankerLocation: tankerLocation
      });
    }
  }, [isLiveTracking, tankerLocation, isWebViewReady]);

  useEffect(() => {
    if (tankerLocation && isWebViewReady && showTankerTracking && isLiveTracking) {
      console.log("📍 Updating tanker location on map:", tankerLocation);
      
      const lastPoint = tankerPathRef.current[tankerPathRef.current.length - 1];
      if (!lastPoint || lastPoint.lat !== tankerLocation.lat || lastPoint.lng !== tankerLocation.lng) {
        tankerPathRef.current = [...tankerPathRef.current, tankerLocation].slice(-100);
      }
      
      postToWebView({
        type: "UPDATE_TANKER_LOCATION",
        lat: tankerLocation.lat,
        lng: tankerLocation.lng,
        path: tankerPathRef.current,
        destination: destinationCoordsRef.current
      });
    }
  }, [tankerLocation, isWebViewReady, showTankerTracking, isLiveTracking]);

  useEffect(() => {
    if (address && isWebViewReady) {
      const coordMatch = address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/);
      
      if (coordMatch) {
        const [latStr, lngStr] = address.split(",").map((s) => s.trim());
        const destination = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
        destinationCoordsRef.current = destination;
        
        postToWebView({
          type: "MOVE_TO",
          lat: destination.lat,
          lng: destination.lng,
          destination: destination
        });
      } else {
        geocodeAddress(address);
      }
    }
  }, [address, isWebViewReady]);

  const geocodeAddress = async (addressString) => {
    try {
      const results = await Location.geocodeAsync(addressString);

      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const destination = { lat: latitude, lng: longitude };
        destinationCoordsRef.current = destination;
        
        postToWebView({
          type: "MOVE_TO",
          lat: latitude,
          lng: longitude,
          destination: destination
        });
      } else {
        const destination = { lat: 33.6844, lng: 73.0479 };
        destinationCoordsRef.current = destination;
        postToWebView({ type: "MOVE_TO", ...destination, destination });
      }
    } catch (error) {
      console.error("📍 Error geocoding address:", error);
      const destination = { lat: 33.6844, lng: 73.0479 };
      destinationCoordsRef.current = destination;
      postToWebView({ type: "MOVE_TO", ...destination, destination });
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { 
          height: 100%; 
          width: 100%;
          margin: 0; 
          padding: 0; 
          overflow: hidden;
        }
        .leaflet-control-attribution { display: none !important; }
        
        /* Tanker truck icon container - LIVE */
        .tanker-marker {
          position: relative;
        }
        
        .tanker-marker::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: rgba(255, 87, 34, 0.3);
          border-radius: 50%;
          animation: ripple 2s ease-out infinite;
        }
        
        /* Tanker truck icon container - STOPPED */
        .tanker-marker-stopped {
          position: relative;
          opacity: 0.7;
        }
        
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        .destination-icon {
          background-color: #4CAF50;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 10px rgba(76,175,80,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .destination-icon::after {
          content: '📍';
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { 
          zoomControl: false,
          dragging: true,
          scrollWheelZoom: true,
          doubleClickZoom: true
        }).setView([33.6844, 73.0479], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        var tankerMarker = null;
        var destinationMarker = null;
        var traveledPath = null;
        var routePath = null;
        var isTrackingLive = false;
        
        var allPathPoints = [];

        function createTankerIcon() {
          var svgIcon = \`
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <!-- Shadow -->
              <ellipse cx="24" cy="44" rx="16" ry="3" fill="rgba(0,0,0,0.2)"/>
              
              <!-- Tanker body (cylinder) -->
              <rect x="8" y="18" width="28" height="14" rx="7" fill="#1976D2"/>
              <rect x="8" y="18" width="28" height="7" rx="3" fill="#2196F3"/>
              
              <!-- Tanker highlights -->
              <rect x="10" y="20" width="24" height="2" rx="1" fill="#64B5F6" opacity="0.6"/>
              
              <!-- Cab -->
              <rect x="32" y="16" width="10" height="16" rx="2" fill="#FF5722"/>
              <rect x="34" y="18" width="6" height="5" rx="1" fill="#87CEEB"/>
              
              <!-- Wheels -->
              <circle cx="14" cy="34" r="4" fill="#333"/>
              <circle cx="14" cy="34" r="2" fill="#666"/>
              <circle cx="28" cy="34" r="4" fill="#333"/>
              <circle cx="28" cy="34" r="2" fill="#666"/>
              <circle cx="38" cy="34" r="4" fill="#333"/>
              <circle cx="38" cy="34" r="2" fill="#666"/>
              
              <!-- Water drop icon on tanker -->
              <path d="M20 22 Q20 26 22 28 Q24 30 24 26 Q24 22 22 20 Q20 18 20 22" fill="#E3F2FD"/>
              
              <!-- Pulsing indicator -->
              <circle cx="24" cy="10" r="6" fill="#FF5722">
                <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="24" cy="10" r="3" fill="white"/>
            </svg>
          \`;
          
          return L.divIcon({
            className: 'tanker-marker',
            html: svgIcon,
            iconSize: [48, 48],
            iconAnchor: [24, 34]
          });
        }

        function createStoppedTankerIcon() {
          var svgIcon = \`
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <!-- Shadow -->
              <ellipse cx="24" cy="44" rx="16" ry="3" fill="rgba(0,0,0,0.2)"/>
              
              <!-- Tanker body (cylinder) -->
              <rect x="8" y="18" width="28" height="14" rx="7" fill="#666"/>
              <rect x="8" y="18" width="28" height="7" rx="3" fill="#888"/>
              
              <!-- Tanker highlights -->
              <rect x="10" y="20" width="24" height="2" rx="1" fill="#AAA" opacity="0.6"/>
              
              <!-- Cab -->
              <rect x="32" y="16" width="10" height="16" rx="2" fill="#999"/>
              <rect x="34" y="18" width="6" height="5" rx="1" fill="#87CEEB"/>
              
              <!-- Wheels -->
              <circle cx="14" cy="34" r="4" fill="#333"/>
              <circle cx="14" cy="34" r="2" fill="#666"/>
              <circle cx="28" cy="34" r="4" fill="#333"/>
              <circle cx="28" cy="34" r="2" fill="#666"/>
              <circle cx="38" cy="34" r="4" fill="#333"/>
              <circle cx="38" cy="34" r="2" fill="#666"/>
              
              <!-- Water drop icon on tanker -->
              <path d="M20 22 Q20 26 22 28 Q24 30 24 26 Q24 22 22 20 Q20 18 20 22" fill="#E3F2FD"/>
              
              <!-- Stopped indicator -->
              <circle cx="24" cy="10" r="6" fill="#FF9800"/>
              <circle cx="24" cy="10" r="3" fill="white"/>
            </svg>
          \`;
          
          return L.divIcon({
            className: 'tanker-marker-stopped',
            html: svgIcon,
            iconSize: [48, 48],
            iconAnchor: [24, 34]
          });
        }

        function createDestinationIcon() {
          var svgIcon = \`
            <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 40 16 40 S32 28 32 16 C32 7.16 24.84 0 16 0Z" fill="#4CAF50"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
              <circle cx="16" cy="16" r="4" fill="#4CAF50"/>
            </svg>
          \`;
          
          return L.divIcon({
            className: '',
            html: svgIcon,
            iconSize: [32, 40],
            iconAnchor: [16, 40]
          });
        }

        function moveTo(lat, lng, destination) {
          try {
            console.log('📍 Moving map to:', lat, lng);
            
            if (destinationMarker) map.removeLayer(destinationMarker);
            
            destinationMarker = L.marker([destination.lat, destination.lng], { 
              icon: createDestinationIcon(),
              zIndexOffset: 500
            }).addTo(map).bindPopup("<b>📍 Destination</b>");
            
            map.setView([lat, lng], 15);
            
          } catch(e) {
            console.error('moveTo error', e);
          }
        }

        async function getOSRMRoute(startLat, startLng, endLat, endLng) {
          try {
            var url = 'https://router.project-osrm.org/route/v1/driving/' + startLng + ',' + startLat + ';' + endLng + ',' + endLat + '?overview=full&geometries=geojson';
            var response = await fetch(url);
            var data = await response.json();
            
            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
              return data.routes[0].geometry.coordinates.map(function(coord) {
                return [coord[1], coord[0]];
              });
            }
            return null;
          } catch (error) {
            console.error('OSRM error:', error);
            return null;
          }
        }

        function handleTrackingStatus(isLiveTracking, tankerLocation) {
          console.log('📍 Tracking status:', isLiveTracking ? 'LIVE' : 'STOPPED');
          isTrackingLive = isLiveTracking;
          
          if (!isLiveTracking && tankerMarker) {
            console.log('📍 Removing tanker marker - tracking stopped');
            map.removeLayer(tankerMarker);
            tankerMarker = null;
            
            if (routePath) {
              map.removeLayer(routePath);
              routePath = null;
            }
          }
          
          if (tankerLocation && !isLiveTracking) {
            console.log('📍 Showing stopped tanker at last known location');
            updateTankerLocation(tankerLocation.lat, tankerLocation.lng, [], null, false);
          }
        }

        async function updateTankerLocation(lat, lng, path, destination, isLive = true) {
          console.log('📍 WebView: Updating tanker to:', lat, lng, 'Live:', isLive);
          
          if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
            console.error('📍 Invalid coordinates:', lat, lng);
            return;
          }
          
          // if (isLive && path && path.length > 0) {
          //   path.forEach(function(point) {
          //     var isDuplicate = allPathPoints.some(function(p) {
          //       return p.lat === point.lat && p.lng === point.lng;
          //     });
          //     if (!isDuplicate) {
          //       allPathPoints.push(point);
          //     }
          //   });
          //   if (allPathPoints.length > 200) {
          //     allPathPoints = allPathPoints.slice(-200);
          //   }
          // }
          
          if (tankerMarker) {
            map.removeLayer(tankerMarker);
            tankerMarker = null;
          }
          
          try {
            var icon = isLive ? createTankerIcon() : createStoppedTankerIcon();
            
            tankerMarker = L.marker([lat, lng], { 
              icon: icon,
              zIndexOffset: 1000
            }).addTo(map);
            
            var popupText = isLive ? 
              '<b>🚛 Water Tanker</b><br>Live Tracking<br>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6) :
              '<b>🚛 Water Tanker</b><br>Tracking Stopped<br>Last known location<br>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6);
            
            tankerMarker.bindPopup(popupText);
            
            console.log('📍 Tanker marker added at:', lat, lng, 'Live:', isLive);
          } catch (e) {
            console.error('📍 Error creating tanker marker:', e);
            return;
          }
          
          if (isLive && allPathPoints.length > 1) {
            if (traveledPath) map.removeLayer(traveledPath);
            
            var coords = allPathPoints.map(function(p) { return [p.lat, p.lng]; });
            
            traveledPath = L.polyline(coords, {
              color: '#FF5722',
              weight: 5,
              opacity: 0.85,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(map);
            
            console.log('📍 Traveled path drawn with', allPathPoints.length, 'points');
          }
          
          if (isLive && destination && destination.lat && destination.lng) {
            if (routePath) map.removeLayer(routePath);
            
            var routeCoords = await getOSRMRoute(lat, lng, destination.lat, destination.lng);
            
            if (routeCoords) {
              routePath = L.polyline(routeCoords, {
                color: '#2196F3',
                weight: 4,
                opacity: 0.7,
                
              }).addTo(map);
            } else {
              routePath = L.polyline([[lat, lng], [destination.lat, destination.lng]], {
                color: '#2196F3',
                weight: 3,
                opacity: 0.6,
                
              }).addTo(map);
            }
          }
          
          map.setView([lat, lng], map.getZoom(), { animate: true });
          
          setTimeout(function() {
            map.invalidateSize();
          }, 100);
        }

        function handleMessage(data) {
          try {
            if (!data || !data.type) return;
            console.log('📍 Handling:', data.type);

            if (data.type === "MOVE_TO") {
              moveTo(data.lat, data.lng, data.destination);
            } else if (data.type === "UPDATE_TANKER_LOCATION") {
              updateTankerLocation(data.lat, data.lng, data.path, data.destination, true);
            } else if (data.type === "TRACKING_STATUS") {
              handleTrackingStatus(data.isLiveTracking, data.tankerLocation);
            } else if (data.type === "CLEAR_PATH") {
              allPathPoints = [];
              if (traveledPath) {
                map.removeLayer(traveledPath);
                traveledPath = null;
              }
            }
          } catch (e) {
            console.error('📍 handleMessage error', e);
          }
        }

        document.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });
        window.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });

        setTimeout(function() {
          map.invalidateSize();
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
          }
        }, 500);
      </script>
    </body>
    </html>
  `;

  const clearTankerPath = () => {
    tankerPathRef.current = [];
    postToWebView({ type: "CLEAR_PATH" });
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "WEBVIEW_READY") {
              console.log("📍 WebView ready");
              setIsWebViewReady(true);
            }
          } catch (error) {
            console.error("Message error:", error);
          }
        }}
        onError={(e) => console.error('WebView error:', e)}
      />
      
      {showTankerTracking && (
        <View style={[
          styles.trackingStatus,
          isLiveTracking ? styles.trackingActive : styles.trackingStopped
        ]}>
          <Text style={styles.trackingText}>
            {isLiveTracking && tankerLocation ? "🚛 Live Tracking" : "⏸️ Tracking Stopped"}
          </Text>
          {isLiveTracking && tankerLocation && (
            <Text style={styles.trackingSubtext}>
              On the Way
            </Text>
          )}
          {!isLiveTracking && tankerLocation && (
            <Text style={styles.trackingSubtext}>
              Last known location
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  trackingStatus: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  trackingActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)', 
    },
  trackingStopped: {
    backgroundColor: 'rgba(255, 152, 0, 0.95)',
  },
  trackingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  trackingSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
});