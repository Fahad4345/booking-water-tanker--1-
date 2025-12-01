


// import React, { useRef, useEffect, useState } from "react";
// import { View, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
// import { WebView } from "react-native-webview";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";

// export default function OpenStreetMapView({
//   onLocationSelect,
//   address,
//   readOnly = false,
//   onMapDragStart,
//   onMapDragEnd, 
// }) {
//   const webviewRef = useRef(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [isWebViewReady, setIsWebViewReady] = useState(false);
//   const pendingAddressRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const isDraggingRef = useRef(false); 

//   useEffect(() => {
//     (async () => {
//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Permission Denied", "Location permission is required");
//           return;
//         }

//         let location = await Location.getCurrentPositionAsync({});
//         const coords = {
//           lat: location.coords.latitude,
//           lng: location.coords.longitude,
//         };
//         console.log("User location obtained:", coords);
//         setUserLocation(coords);
//       } catch (error) {
//         console.error("Error getting location:", error);
//       }
//     })();
//   }, []);

//   const postToWebView = (obj) => {
//     try {
//       if (webviewRef.current && webviewRef.current.postMessage) {
//         webviewRef.current.postMessage(JSON.stringify(obj));
//       } else {
//         pendingAddressRef.current = obj;
//       }
//     } catch (e) {
//       console.error("postToWebView error:", e);
//     }
//   };

//   useEffect(() => {
//     if (userLocation && isWebViewReady) {
//       console.log("Sending user location to map:", userLocation);
//       postToWebView({
//         type: "USER_LOCATION",
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//       });
//     }
//   }, [userLocation, isWebViewReady]);

//   useEffect(() => {
//     if (isWebViewReady && pendingAddressRef.current && webviewRef.current) {
//       try {
//         webviewRef.current.postMessage(
//           JSON.stringify(pendingAddressRef.current)
//         );
//         pendingAddressRef.current = null;
//       } catch (e) {
//         console.error("Failed to flush pending message:", e);
//       }
//     }
//   }, [isWebViewReady]);

//   useEffect(() => {
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }

//     if (!address || address.trim().length === 0) {
//       return;
//     }

//     debounceTimerRef.current = setTimeout(() => {
//       const coordMatch = address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/);
//       if (coordMatch) {
//         const [latStr, lngStr] = address.split(",").map((s) => s.trim());
//         postToWebView({
//           type: "MOVE_TO",
//           lat: parseFloat(latStr),
//           lng: parseFloat(lngStr),
//         });
//         return;
//       }

//       if (!isWebViewReady) {
//         pendingAddressRef.current = { type: "GEOCODE_AND_MOVE", address };
//         return;
//       }

//       geocodeAddress(address);
//     }, 600);

//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//     };
//   }, [address, isWebViewReady]);

//   const geocodeAddress = async (addressString) => {
//     try {
//       console.log("Geocoding address:", addressString);
//       const results = await Location.geocodeAsync(addressString);

//       if (results && results.length > 0) {
//         const { latitude, longitude } = results[0];
//         console.log("Found location:", latitude, longitude);

//         postToWebView({
//           type: "MOVE_TO",
//           lat: latitude,
//           lng: longitude,
//         });
//       } else {
//         console.log("No results found for address:", addressString);
//       }
//     } catch (error) {
//       console.error("Error geocoding address:", error);
//     }
//   };

//   const resetToMyLocation = () => {
//     if (userLocation && isWebViewReady) {
//       console.log("Resetting to user location:", userLocation);
//       postToWebView({
//         type: "MOVE_TO_USER_LOCATION",
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//       });
//     } else {
//       Alert.alert("Location Not Available", "Your current location is not available yet. Please wait a moment.");
//     }
//   };

//   const getAddressFromCoords = async (lat, lng) => {
//     try {
//       const [place] = await Location.reverseGeocodeAsync({
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lng),
//       });
//       if (place) {
//         const addressParts = [
//           place.name,
//           place.street,
//           place.city,
//           place.region,
//           place.country,
//         ].filter(Boolean);
//         return addressParts.join(", ");
//       }
//       return "Unknown location";
//     } catch (error) {
//       console.error("Error fetching address:", error);
//       return "Address not found";
//     }
//   };

//   const handleMapMessage = async (data) => {
//     try {
//       if (data.type === "WEBVIEW_READY") {
//         setIsWebViewReady(true);
//         if (pendingAddressRef.current && pendingAddressRef.current.type === "GEOCODE_AND_MOVE") {
//           geocodeAddress(pendingAddressRef.current.address);
//           pendingAddressRef.current = null;
//         }
//       } else if (data.type === "MAP_MOVED" && data.lat && data.lng) {
//         const address = await getAddressFromCoords(data.lat, data.lng);
        
//         // Call onLocationSelect with the new coordinates and address
//         onLocationSelect?.({
//           lat: data.lat,
//           lng: data.lng,
//           address: address,
//         });

//         // If we were dragging, call the drag end callback
//         if (isDraggingRef.current) {
//           isDraggingRef.current = false;
//           onMapDragEnd?.({
//             lat: data.lat,
//             lng: data.lng,
//             address: address,
//           });
//         }
//       } else if (data.type === "MAP_DRAG_START") {
//         isDraggingRef.current = true;
//         onMapDragStart?.();
//       } else if (data.type === "MAP_DRAG_END") {
//         // Direct drag end event from the map
//         isDraggingRef.current = false;
//         if (data.lat && data.lng) {
//           const address = await getAddressFromCoords(data.lat, data.lng);
//           onMapDragEnd?.({
//             lat: data.lat,
//             lng: data.lng,
//             address: address,
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error);
//     }
//   };

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//       <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//       <style>
//         html, body, #map { height: 100%; margin: 0; padding: 0; }
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .center-pin {
//           position: absolute;
//           top: 30%;
//           left: 50%;
//           width: 30px;
//           height: 30px;
//           margin-left: -15px;
//           margin-top: -30px;
//           background-image: url('https://cdn-icons-png.flaticon.com/128/446/446075.png');
//           background-size: contain;
//           background-repeat: no-repeat;
//           pointer-events: none;
//           z-index: 999;
//         }
        
//         /* User location button styles */
//         .leaflet-control-locate {
//           border: 2px solid rgba(0,0,0,0.2);
//           background-clip: padding-box;
//           border-radius: 4px;
//         }
        
//         .leaflet-control-locate a {
//           background-color: #fff;
//           background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDhDNTEuMSA4IDggOS43OSA4IDEyQzggMTQuMjEgOS43OSAxNiAxMiAxNkMxNC4yMSAxNiAxNiAxNC4yMSAxNiAxMkMxNiA5Ljc5IDE0LjIxIDggMTIgOFpNMTIgMTRDMTMuMSAxNCAxNCAxMy4xIDE0IDEyQzE0IDEwLjkgMTMuMSAxMCAxMiAxMEMxMC45IDEwIDEwIDEwLjkgMTAgMTJDMTAgMTMuMSAxMC45IDE0IDEyIDE0Wk0yMCAxMkwyMiAxMkwyMiAxMEwyMCAxMFYxMlpNMiAxMkw0IDEyTDQgMTBIMlYxMlpNMTIgMkMxMiA0TDEyIDRMMTIgOEwxMiA4TDEyIDJMMTIgMlpNMTIgMjBMMTIgMTZMMTIgMTZMMTIgMjBMMTIgMjBaIiBmaWxsPSIjNDQ0NDQ0Ii8+Cjwvc3ZnPgo=');
//           background-size: 16px 16px;
//           background-position: center;
//           background-repeat: no-repeat;
//           width: 30px;
//           height: 30px;
//           display: block;
//           border-radius: 4px;
//         }
        
//         .leaflet-control-locate a:hover {
//           background-color: #f4f4f4;
//         }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <div class="center-pin"></div>
//       <script>
//         var map = L.map('map', { zoomControl: false }).setView([33.666265, 73.0479], 13);

//         L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//           maxZoom: 19,
//           attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         }).addTo(map);

//         var userMarker = null;
//         var accuracyCircle = null;
//         var currentMapState = {
//           center: map.getCenter(),
//           zoom: map.getZoom()
//         };
//         var isDragging = false;

//         // Track drag start
//         map.on('dragstart', function() {
//           isDragging = true;
//           window.ReactNativeWebView.postMessage(JSON.stringify({ 
//             type: "MAP_DRAG_START" 
//           }));
//         });

//         // Track drag end
//         map.on('dragend', function() {
//           if (isDragging) {
//             isDragging = false;
//             var center = map.getCenter();
//             window.ReactNativeWebView.postMessage(JSON.stringify({
//               type: "MAP_DRAG_END",
//               lat: center.lat.toFixed(6),
//               lng: center.lng.toFixed(6)
//             }));
//           }
//         });

//         // Track move end (for any map movement including zoom)
//         map.on('moveend', function() {
//           currentMapState.center = map.getCenter();
//           currentMapState.zoom = map.getZoom();
          
//           var center = map.getCenter();
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: "MAP_MOVED",
//             lat: center.lat.toFixed(6),
//             lng: center.lng.toFixed(6)
//           }));
//         });

//         map.on('zoomend', function() {
//           currentMapState.zoom = map.getZoom();
//         });
//         var destinationMarker = null;



//        function moveTo(lat, lng) {
//   try {
//     // Set map center normally first
//     map.setView([lat, lng], 16); // your desired zoom

//     // Then pan the map upward by 30% of the map container height
//     const mapHeight = map.getSize().y; // height in pixels
//     const yOffset = mapHeight * 0.3; // 30% from top
//     map.panBy([0, -yOffset], { animate: true });
//   } catch(e) {
//     console.error('moveTo error', e);
//   }
// }

// function moveToUserLocation(lat, lng) {
//   try {
//     map.setView([lat, lng], currentMapState.zoom);

//     const mapHeight = map.getSize().y;
//     const yOffset = mapHeight * 0.8;
//     map.panBy([0, -yOffset], { animate: true });
//   } catch(e) {
//     console.error('moveToUserLocation error', e);
//   }
// }

//        function showUserLocation(lat, lng) {
//   if (userMarker) map.removeLayer(userMarker);
//   if (accuracyCircle) map.removeLayer(accuracyCircle);
  
//   accuracyCircle = L.circle([lat, lng], {
//     radius: 50,
//     color: "#4285F4",
//     fillColor: "#4285F4",
//     fillOpacity: 0.1,
//     weight: 1,
//   }).addTo(map);
  
//   userMarker = L.circleMarker([lat, lng], {
//     radius: 8,
//     color: "#FFFFFF",
//     fillColor: "#4285F4",
//     fillOpacity: 1,
//     weight: 3,
//   }).addTo(map);
  
//   // If destination exists, fit map to show both
//   if (destinationMarker) {
//     setDestination(destinationMarker.getLatLng().lat, destinationMarker.getLatLng().lng);
//   } else {
//     moveTo(lat, lng); // show user at top 30%
//   }
// }


//         function handleMessage(data) {
//           try {
//             console.log('Web content received:', data);
//             if (!data || !data.type) return;

//             if (data.type === "MOVE_TO") {
//               moveTo(data.lat, data.lng);
//             } else if (data.type === "USER_LOCATION") {
//               showUserLocation(data.lat, data.lng);
//               moveTo(data.lat, data.lng);
//             } else if (data.type === "MOVE_TO_USER_LOCATION") {
//               moveToUserLocation(data.lat, data.lng);
//               showUserLocation(data.lat, data.lng);
//             } else if (data.type === "GEOCODE_AND_MOVE") {
//               // The native side requested a geocode -> we don't geocode here,
//               // native will geocode and send MOVE_TO, but keep for compatibility.
//             }
//           } catch (e) {
//             console.error('handleMessage error', e);
//           }
//         }

//         document.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });
//         window.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });

//         window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webviewRef}
//         originWhitelist={["*"]}
//         source={{ html }}
//         javaScriptEnabled
//         domStorageEnabled
//         onMessage={async (event) => {
//           try {
//             const data = JSON.parse(event.nativeEvent.data);
//             await handleMapMessage(data);
//           } catch (error) {
//             console.error("Error handling message:", error);
//           }
//         }}
//       />
      
//       {!readOnly &&    (
//         <TouchableOpacity 
//           style={styles.resetLocationButton}
//           onPress={resetToMyLocation}
//         >
//           <Ionicons name="location" size={20} color="#1976D2" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1,
//   },
//   resetLocationButton: {
//     position: 'absolute',
//     bottom: 400,
//     right: 16,
//     backgroundColor: '#fff',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
// });




// import React, { useRef, useEffect, useState } from "react";
// import { View, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
// import { WebView } from "react-native-webview";
// import * as Location from "expo-location";
// import { Ionicons } from "@expo/vector-icons";

// export default function OpenStreetMapView({
//   onLocationSelect,
//   address,
//   readOnly = false,
//   onMapDragStart,
//   onMapDragEnd, 
// }) {
//   const webviewRef = useRef(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [isWebViewReady, setIsWebViewReady] = useState(false);
//   const pendingAddressRef = useRef(null);
//   const debounceTimerRef = useRef(null);
//   const isDraggingRef = useRef(false); 

//   useEffect(() => {
//     (async () => {
//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           Alert.alert("Permission Denied", "Location permission is required");
//           return;
//         }

//         let location = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Highest,
//           maximumAge: 10000,
//           timeout: 5000,
//         });
//         const coords = {
//           lat: location.coords.latitude,
//           lng: location.coords.longitude,
//         };
//         console.log("User location obtained:", coords);
//         setUserLocation(coords);
//       } catch (error) {
//         console.error("Error getting location:", error);
//       }
//     })();
//   }, []);

//   const postToWebView = (obj) => {
//     try {
//       if (webviewRef.current && webviewRef.current.postMessage) {
//         webviewRef.current.postMessage(JSON.stringify(obj));
//       } else {
//         pendingAddressRef.current = obj;
//       }
//     } catch (e) {
//       console.error("postToWebView error:", e);
//     }
//   };

//   useEffect(() => {
//     if (userLocation && isWebViewReady) {
//       console.log("Sending user location to map:", userLocation);
//       postToWebView({
//         type: "USER_LOCATION",
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//       });
//     }
//   }, [userLocation, isWebViewReady]);

//   useEffect(() => {
//     if (isWebViewReady && pendingAddressRef.current && webviewRef.current) {
//       try {
//         webviewRef.current.postMessage(
//           JSON.stringify(pendingAddressRef.current)
//         );
//         pendingAddressRef.current = null;
//       } catch (e) {
//         console.error("Failed to flush pending message:", e);
//       }
//     }
//   }, [isWebViewReady]);

//   useEffect(() => {
//     if (debounceTimerRef.current) {
//       clearTimeout(debounceTimerRef.current);
//     }

//     if (!address || address.trim().length === 0) {
//       return;
//     }

//     debounceTimerRef.current = setTimeout(() => {
//       const coordMatch = address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/);
//       if (coordMatch) {
//         const [latStr, lngStr] = address.split(",").map((s) => s.trim());
//         postToWebView({
//           type: "MOVE_TO",
//           lat: parseFloat(latStr),
//           lng: parseFloat(lngStr),
//         });
//         return;
//       }

//       if (!isWebViewReady) {
//         pendingAddressRef.current = { type: "GEOCODE_AND_MOVE", address };
//         return;
//       }

//       geocodeAddress(address);
//     }, 600);

//     return () => {
//       if (debounceTimerRef.current) {
//         clearTimeout(debounceTimerRef.current);
//       }
//     };
//   }, [address, isWebViewReady]);

//   const geocodeAddress = async (addressString) => {
//     try {
//       console.log("Geocoding address:", addressString);
//       const results = await Location.geocodeAsync(addressString);

//       if (results && results.length > 0) {
//         const { latitude, longitude } = results[0];
//         console.log("Found location:", latitude, longitude);

//         postToWebView({
//           type: "MOVE_TO",
//           lat: latitude,
//           lng: longitude,
//         });
//       } else {
//         console.log("No results found for address:", addressString);
//       }
//     } catch (error) {
//       console.error("Error geocoding address:", error);
//     }
//   };

//   const resetToMyLocation = () => {
//     if (userLocation && isWebViewReady) {
//       console.log("Resetting to user location:", userLocation);
//       postToWebView({
//         type: "MOVE_TO_USER_LOCATION",
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//       });
//     } else {
//       Alert.alert("Location Not Available", "Your current location is not available yet. Please wait a moment.");
//     }
//   };

//   const getAddressFromCoords = async (lat, lng) => {
//     try {
//       const [place] = await Location.reverseGeocodeAsync({
//         latitude: parseFloat(lat),
//         longitude: parseFloat(lng),
//       });
//       if (place) {
//         const addressParts = [
//           place.name,
//           place.street,
//           place.city,
//           place.region,
//           place.country,
//         ].filter(Boolean);
//         return addressParts.join(", ");
//       }
//       return "Unknown location";
//     } catch (error) {
//       console.error("Error fetching address:", error);
//       return "Address not found";
//     }
//   };

//   const handleMapMessage = async (data) => {
//     try {
//       if (data.type === "WEBVIEW_READY") {
//         setIsWebViewReady(true);
//         if (pendingAddressRef.current && pendingAddressRef.current.type === "GEOCODE_AND_MOVE") {
//           geocodeAddress(pendingAddressRef.current.address);
//           pendingAddressRef.current = null;
//         }
//       } else if (data.type === "MAP_MOVED" && data.lat && data.lng) {
//         const address = await getAddressFromCoords(data.lat, data.lng);
        
//         // Call onLocationSelect with the new coordinates and address
//         onLocationSelect?.({
//           lat: data.lat,
//           lng: data.lng,
//           address: address,
//         });

//         // If we were dragging, call the drag end callback
//         if (isDraggingRef.current) {
//           isDraggingRef.current = false;
//           onMapDragEnd?.({
//             lat: data.lat,
//             lng: data.lng,
//             address: address,
//           });
//         }
//       } else if (data.type === "MAP_DRAG_START") {
//         isDraggingRef.current = true;
//         onMapDragStart?.();
//       } else if (data.type === "MAP_DRAG_END") {
//         // Direct drag end event from the map
//         isDraggingRef.current = false;
//         if (data.lat && data.lng) {
//           const address = await getAddressFromCoords(data.lat, data.lng);
//           onMapDragEnd?.({
//             lat: data.lat,
//             lng: data.lng,
//             address: address,
//           });
//         }
//       }
//     } catch (error) {
//       console.error("Error handling message:", error);
//     }
//   };

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
//       <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
//       <style>
//         html, body, #map { height: 100%; margin: 0; padding: 0; }
//         .leaflet-control-attribution {
//           display: none !important;
//         }

//         .center-pin {
//           position: absolute;
//           top: 20%;
//           left: 50%;
//           width: 30px;
//           height: 30px;
//           margin-left: -14px;
//           margin-top: -27px;
//           background-image: url('https://cdn-icons-png.flaticon.com/128/446/446075.png');
//           background-size: contain;
//           background-repeat: no-repeat;
//           pointer-events: none;
//           z-index: 999;
//           filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
//         }
        
//         .user-location-pin {
//           position: absolute;
//           width: 24px;
//           height: 24px;
        
//           background-size: contain;
//           background-repeat: no-repeat;
//           pointer-events: none;
//           z-index: 998;
//           filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
//         }
        
//         /* User location button styles */
//         .leaflet-control-locate {
//           border: 2px solid rgba(0,0,0,0.2);
//           background-clip: padding-box;
//           border-radius: 4px;
//         }
        
//         .leaflet-control-locate a {
//           background-color: #fff;
//           background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDhDNTEuMSA4IDggOS43OSA4IDEyQzggMTQuMjEgOS43OSAxNiAxMiAxNkMxNC4yMSAxNiAxNiAxNC4yMSAxNiAxMkMxNiA5Ljc5IDE0LjIxIDggMTIgOFpNMTIgMTRDMTMuMSAxNCAxNCAxMy4xIDE0IDEyQzE0IDEwLjkgMTMuMSAxMCAxMiAxMEMxMC45IDEwIDEwIDEwLjkgMTAgMTJDMTAgMTMuMSAxMC45IDE0IDEyIDE0Wk0yMCAxMkwyMiAxMkwyMiAxMEwyMCAxMFYxMlpNMiAxMkw0IDEyTDQgMTBIMlYxMlpNMTIgMkMxMiA0TDEyIDRMMTIgOEwxMiA4TDEyIDJMMTIgMlpNMTIgMjBMMTIgMTZMMTIgMTZMMTIgMjBMMTIgMjBaIiBmaWxsPSIjNDQ0NDQ0Ii8+Cjwvc3ZnPgo=');
//           background-size: 16px 16px;
//           background-position: center;
//           background-repeat: no-repeat;
//           width: 30px;
//           height: 30px;
//           display: block;
//           border-radius: 4px;
//         }
        
//         .leaflet-control-locate a:hover {
//           background-color: #f4f4f4;
//         }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <div class="center-pin"></div>
//       <div id="userLocationPin" class="user-location-pin" style="display: none;"></div>
//       <script>
//         var map = L.map('map', { zoomControl: false }).setView([33.666265, 73.0479], 13);

//         L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//           maxZoom: 19,
//           attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         }).addTo(map);

//         var userMarker = null;
//         var accuracyCircle = null;
//         var currentMapState = {
//           center: map.getCenter(),
//           zoom: map.getZoom()
//         };
//         var isDragging = false;
//         var userLatLng = null;
//         var userPinElement = document.getElementById('userLocationPin');
//         var centerPinElement = document.querySelector('.center-pin');

//         function updateUserPinPosition() {
//           if (!userLatLng) return;
          
//           var point = map.latLngToContainerPoint(userLatLng);
//           userPinElement.style.left = point.x - 12 + 'px';
//           userPinElement.style.top = point.y - 24 + 'px';
//           userPinElement.style.display = 'block';
//         }

//         // Update user pin position when map moves
//         map.on('move', updateUserPinPosition);
//         map.on('zoom', updateUserPinPosition);

//         // Track drag start
//         map.on('dragstart', function() {
//           isDragging = true;
//           window.ReactNativeWebView.postMessage(JSON.stringify({ 
//             type: "MAP_DRAG_START" 
//           }));
//         });

//         // Track drag end
//         map.on('dragend', function() {
//           if (isDragging) {
//             isDragging = false;
//             var center = map.getCenter();
//             window.ReactNativeWebView.postMessage(JSON.stringify({
//               type: "MAP_DRAG_END",
//               lat: center.lat.toFixed(6),
//               lng: center.lng.toFixed(6)
//             }));
//           }
//         });

//         // Track move end (for any map movement including zoom)
//         map.on('moveend', function() {
//           currentMapState.center = map.getCenter();
//           currentMapState.zoom = map.getZoom();
          
//           var center = map.getCenter();
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: "MAP_MOVED",
//             lat: center.lat.toFixed(6),
//             lng: center.lng.toFixed(6)
//           }));
//         });

//         map.on('zoomend', function() {
//           currentMapState.zoom = map.getZoom();
//         });
//         var destinationMarker = null;

//         function moveTo(lat, lng) {
//           try {
//             map.setView([lat, lng], 16);
//           } catch(e) {
//             console.error('moveTo error', e);
//           }
//         }

//         function moveToUserLocation(lat, lng) {
//           try {
//             // Center the map so user location is at the bottom (under center pin)
//             var centerPoint = map.getSize();
//             var userPoint = map.latLngToContainerPoint([lat, lng]);
            
//             // Calculate offset to position user location 30% from bottom
//             var offsetY = centerPoint.y * 0.3;
//             var targetPoint = L.point(userPoint.x, userPoint.y + offsetY);
//             var targetLatLng = map.containerPointToLatLng(targetPoint);
            
//             map.setView(targetLatLng, currentMapState.zoom);
//           } catch(e) {
//             console.error('moveToUserLocation error', e);
//           }
//         }

//         function showUserLocation(lat, lng) {
//           if (userMarker) map.removeLayer(userMarker);
//           if (accuracyCircle) map.removeLayer(accuracyCircle);
          
//           userLatLng = L.latLng(lat, lng);
          
//           accuracyCircle = L.circle(userLatLng, {
//             radius: 50,
//             color: "#4285F4",
//             fillColor: "#4285F4",
//             fillOpacity: 0.1,
//             weight: 1,
//           }).addTo(map);
          
//           userMarker = L.circleMarker(userLatLng, {
//             radius: 8,
//             color: "#FFFFFF",
//             fillColor: "#4285F4",
//             fillOpacity: 1,
//             weight: 3,
//           }).addTo(map);
          
//           // Update pin position
//           updateUserPinPosition();
          
//           // If destination exists, fit map to show both
//           if (destinationMarker) {
//             setDestination(destinationMarker.getLatLng().lat, destinationMarker.getLatLng().lng);
//           } else {
//             // Position user location under center pin
//             moveToUserLocation(lat, lng);
//           }
//         }

//         function handleMessage(data) {
//           try {
//             console.log('Web content received:', data);
//             if (!data || !data.type) return;

//             if (data.type === "MOVE_TO") {
//               moveTo(data.lat, data.lng);
//             } else if (data.type === "USER_LOCATION") {
//               showUserLocation(data.lat, data.lng);
//               // Don't move map here, let showUserLocation handle positioning
//             } else if (data.type === "MOVE_TO_USER_LOCATION") {
//               showUserLocation(data.lat, data.lng);
//             } else if (data.type === "GEOCODE_AND_MOVE") {
//               // The native side requested a geocode -> we don't geocode here,
//               // native will geocode and send MOVE_TO, but keep for compatibility.
//             }
//           } catch (e) {
//             console.error('handleMessage error', e);
//           }
//         }

//         document.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });
//         window.addEventListener('message', function(e) {
//           try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
//         });

//         window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <View style={styles.container}>
//       <WebView
//         ref={webviewRef}
//         originWhitelist={["*"]}
//         source={{ html }}
//         javaScriptEnabled
//         domStorageEnabled
//         onMessage={async (event) => {
//           try {
//             const data = JSON.parse(event.nativeEvent.data);
//             await handleMapMessage(data);
//           } catch (error) {
//             console.error("Error handling message:", error);
//           }
//         }}
//       />
      
//       {!readOnly && (
//         <TouchableOpacity 
//           style={styles.resetLocationButton}
//           onPress={resetToMyLocation}
//         >
//           <Ionicons name="location" size={20} color="#1976D2" />
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1,
//   },
//   resetLocationButton: {
//     position: 'absolute',
//     bottom: 400,
//     right: 16,
//     backgroundColor: '#fff',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
// });


import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

export default function OpenStreetMapView({
  onLocationSelect,
  address,
  readOnly = false,
  onMapDragStart,
  onMapDragEnd, 
}) {
  const webviewRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const pendingAddressRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [showAddressPopup, setShowAddressPopup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required");
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        console.log("User location obtained:", coords);
        setUserLocation(coords);
      } catch (error) {
        console.error("Error getting location:", error);
      }
    })();
  }, []);

  const postToWebView = (obj) => {
    try {
      if (webviewRef.current && webviewRef.current.postMessage) {
        webviewRef.current.postMessage(JSON.stringify(obj));
      } else {
        pendingAddressRef.current = obj;
      }
    } catch (e) {
      console.error("postToWebView error:", e);
    }
  };

  useEffect(() => {
    if (userLocation && isWebViewReady) {
      console.log("Sending user location to map:", userLocation);
      postToWebView({
        type: "USER_LOCATION",
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
    }
  }, [userLocation, isWebViewReady]);

  useEffect(() => {
    if (isWebViewReady && pendingAddressRef.current && webviewRef.current) {
      try {
        webviewRef.current.postMessage(
          JSON.stringify(pendingAddressRef.current)
        );
        pendingAddressRef.current = null;
      } catch (e) {
        console.error("Failed to flush pending message:", e);
      }
    }
  }, [isWebViewReady]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!address || address.trim().length === 0) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      const coordMatch = address.trim().match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/);
      if (coordMatch) {
        const [latStr, lngStr] = address.split(",").map((s) => s.trim());
        postToWebView({
          type: "MOVE_TO",
          lat: parseFloat(latStr),
          lng: parseFloat(lngStr),
        });
        return;
      }

      if (!isWebViewReady) {
        pendingAddressRef.current = { type: "GEOCODE_AND_MOVE", address };
        return;
      }

      geocodeAddress(address);
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [address, isWebViewReady]);

  const geocodeAddress = async (addressString) => {
    try {
      console.log("Geocoding address:", addressString);
      const results = await Location.geocodeAsync(addressString);

      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        console.log("Found location:", latitude, longitude);

        postToWebView({
          type: "MOVE_TO",
          lat: latitude,
          lng: longitude,
        });
      } else {
        console.log("No results found for address:", addressString);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  const resetToMyLocation = () => {
    if (userLocation && isWebViewReady) {
      console.log("Resetting to user location:", userLocation);
      postToWebView({
        type: "MOVE_TO_USER_LOCATION",
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
    } else {
      Alert.alert("Location Not Available", "Your current location is not available yet. Please wait a moment.");
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
      });
      if (place) {
        const addressParts = [
          place.name,
          place.street,
          place.city,
          place.region,
          place.country,
        ].filter(Boolean);
        return addressParts.join(", ");
      }
      return "Unknown location";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Address not found";
    }
  };

  const handleMapMessage = async (data) => {
    try {
      if (data.type === "WEBVIEW_READY") {
        setIsWebViewReady(true);
        if (pendingAddressRef.current && pendingAddressRef.current.type === "GEOCODE_AND_MOVE") {
          geocodeAddress(pendingAddressRef.current.address);
          pendingAddressRef.current = null;
        }
      } else if (data.type === "PIN_LOCATION_UPDATED" && data.lat && data.lng) {
        // This is the location at the PIN (30% from top), not map center
        const address = await getAddressFromCoords(data.lat, data.lng);
        
        // Update address state and show popup
        setCurrentAddress(address);
        setShowAddressPopup(true);
        
        // Hide popup after 3 seconds
        // setTimeout(() => {
        //   setShowAddressPopup(false);
        // }, 3000);
        
        onLocationSelect?.({
          lat: data.lat,
          lng: data.lng,
          address: address,
        });

        if (isDraggingRef.current) {
          isDraggingRef.current = false;
          onMapDragEnd?.({
            lat: data.lat,
            lng: data.lng,
            address: address,
          });
        }
      } else if (data.type === "MAP_DRAG_START") {
        isDraggingRef.current = true;
        setShowAddressPopup(false); // Hide popup when dragging starts
        onMapDragStart?.();
      } else if (data.type === "MAP_DRAG_END") {
        isDraggingRef.current = false;
        if (data.lat && data.lng) {
          const address = await getAddressFromCoords(data.lat, data.lng);
          
          // Update address and show popup
          setCurrentAddress(address);
          setShowAddressPopup(true);
          
          // setTimeout(() => {
          //   setShowAddressPopup(false);
          // }, 3000);
          
          onMapDragEnd?.({
            lat: data.lat,
            lng: data.lng,
            address: address,
          });
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-control-attribution {
          display: none !important;
        }

        .center-pin {
          position: absolute;
          top: 30%;
          left: 50%;
          width: 30px;
          height: 30px;
          margin-left: -15px;
          margin-top: -30px;
          background-image: url('https://cdn-icons-png.flaticon.com/128/446/446075.png');
          background-size: contain;
          background-repeat: no-repeat;
          pointer-events: none;
          z-index: 999;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
        }
        
        .user-location-pin {
          position: absolute;
          width: 24px;
          height: 24px;
          background-size: contain;
          background-repeat: no-repeat;
          pointer-events: none;
          z-index: 998;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="center-pin"></div>
      <div id="userLocationPin" class="user-location-pin" style="display: none;"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([33.666265, 73.0479], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var userMarker = null;
        var accuracyCircle = null;
        var currentMapState = {
          center: map.getCenter(),
          zoom: map.getZoom()
        };
        var isDragging = false;
        var userLatLng = null;
        var userPinElement = document.getElementById('userLocationPin');

        // Get the coordinates at the pin location (30% from top)
        function getPinCoordinates() {
          var mapSize = map.getSize();
          var pinPoint = L.point(mapSize.x / 2, mapSize.y * 0.30);
          return map.containerPointToLatLng(pinPoint);
        }

        function updateUserPinPosition() {
          if (!userLatLng) return;
          
          var point = map.latLngToContainerPoint(userLatLng);
          userPinElement.style.left = point.x - 12 + 'px';
          userPinElement.style.top = point.y - 24 + 'px';
          userPinElement.style.display = 'block';
        }

        // Update user pin position when map moves
        map.on('move', function() {
          updateUserPinPosition();
        });
        
        map.on('zoom', updateUserPinPosition);

        // Track drag start
        map.on('dragstart', function() {
          isDragging = true;
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            type: "MAP_DRAG_START" 
          }));
        });

        // Track drag end
        map.on('dragend', function() {
          if (isDragging) {
            isDragging = false;
            var pinLatLng = getPinCoordinates();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "MAP_DRAG_END",
              lat: pinLatLng.lat.toFixed(7),
              lng: pinLatLng.lng.toFixed(7)
            }));
          }
        });

        // Track move end
        map.on('moveend', function() {
          currentMapState.center = map.getCenter();
          currentMapState.zoom = map.getZoom();
          
          // Only send coordinates when map stops moving
          var pinLatLng = getPinCoordinates();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "PIN_LOCATION_UPDATED",
            lat: pinLatLng.lat.toFixed(7),
            lng: pinLatLng.lng.toFixed(7)
          }));
        });

        map.on('zoomend', function() {
          currentMapState.zoom = map.getZoom();
        });

        var destinationMarker = null;

        function moveTo(lat, lng) {
          try {
            // Calculate map center so that the given coordinates appear at the pin (30% from top)
            var targetLatLng = L.latLng(lat, lng);
            var mapSize = map.getSize();
            var pinPoint = L.point(mapSize.x / 2, mapSize.y * 0.30);
            var centerPoint = L.point(mapSize.x / 2, mapSize.y / 2);
            var offset = centerPoint.subtract(pinPoint);
            
            var targetPoint = map.project(targetLatLng, map.getZoom());
            var adjustedPoint = targetPoint.add(offset);
            var adjustedLatLng = map.unproject(adjustedPoint, map.getZoom());
            
            map.setView(adjustedLatLng, 16);
          } catch(e) {
            console.error('moveTo error', e);
          }
        }

        function moveToUserLocation(lat, lng) {
          try {
            // Position user location at the pin (30% from top)
            var targetLatLng = L.latLng(lat, lng);
            var mapSize = map.getSize();
            var pinPoint = L.point(mapSize.x / 2, mapSize.y * 0.30);
            var centerPoint = L.point(mapSize.x / 2, mapSize.y / 2);
            var offset = centerPoint.subtract(pinPoint);
            
            var targetPoint = map.project(targetLatLng, currentMapState.zoom);
            var adjustedPoint = targetPoint.add(offset);
            var adjustedLatLng = map.unproject(adjustedPoint, currentMapState.zoom);
            
            map.setView(adjustedLatLng, currentMapState.zoom);
          } catch(e) {
            console.error('moveToUserLocation error', e);
          }
        }

        function showUserLocation(lat, lng) {
          if (userMarker) map.removeLayer(userMarker);
          if (accuracyCircle) map.removeLayer(accuracyCircle);
          
          userLatLng = L.latLng(lat, lng);
          
          accuracyCircle = L.circle(userLatLng, {
            radius: 50,
            color: "#4285F4",
            fillColor: "#4285F4",
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(map);
          
          userMarker = L.circleMarker(userLatLng, {
            radius: 8,
            color: "#FFFFFF",
            fillColor: "#4285F4",
            fillOpacity: 1,
            weight: 3,
          }).addTo(map);
          
          updateUserPinPosition();
          
          if (destinationMarker) {
            setDestination(destinationMarker.getLatLng().lat, destinationMarker.getLatLng().lng);
          } else {
            moveToUserLocation(lat, lng);
          }
        }

        function handleMessage(data) {
          try {
            console.log('Web content received:', data);
            if (!data || !data.type) return;

            if (data.type === "MOVE_TO") {
              moveTo(data.lat, data.lng);
            } else if (data.type === "USER_LOCATION") {
              showUserLocation(data.lat, data.lng);
            } else if (data.type === "MOVE_TO_USER_LOCATION") {
              showUserLocation(data.lat, data.lng);
            } else if (data.type === "GEOCODE_AND_MOVE") {
              // Handled by native side
            }
          } catch (e) {
            console.error('handleMessage error', e);
          }
        }

        document.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });
        window.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "WEBVIEW_READY" }));
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={async (event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            await handleMapMessage(data);
          } catch (error) {
            console.error("Error handling message:", error);
          }
        }}
      />
      
      {!readOnly && (
        <>
          <TouchableOpacity 
            style={styles.resetLocationButton}
            onPress={resetToMyLocation}
          >
            <Ionicons name="location" size={20} color="#1976D2" />
          </TouchableOpacity>
          
          {showAddressPopup && currentAddress && (
            <View style={styles.addressPopup}>
              <Text style={styles.addressText} numberOfLines={1}>
                {currentAddress}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  resetLocationButton: {
    position: 'absolute',
    bottom: 400,
    right: 16,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressPopup: {
    position: 'absolute',
    bottom: 510,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
});