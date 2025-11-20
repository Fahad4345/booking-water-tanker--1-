import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView } from "react-native-webview";

const RouteMap = ({ currentLocation, destination, tankerLocation }) => {
  const webviewRef = useRef(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isWebViewReady && currentLocation && destination) {
      console.log("Sending route data:", { 
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
        
      
        .leaflet-control-attribution,
        .leaflet-control-zoom,
        .leaflet-control-scale,
        .leaflet-routing-container {
          display: none !important;
        }
        
       
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
 
  var map = L.map('map', { 
    zoomControl: true,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: false,
    touchZoom: true
  });
  
  
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: ''
  }).addTo(map);
  
  var routingControl = null;
  var startMarker = null;
  var endMarker = null;
  var tankerMarker = null;
  var isFirstRoute = true; // Track if it's the first route

  function showRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng) {
    
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    if (tankerMarker) map.removeLayer(tankerMarker);

   
    startMarker = L.marker([startLat, startLng], {
      icon: L.divIcon({
        className: 'start-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).bindPopup(" Your Location").addTo(map);

    
    endMarker = L.marker([endLat, endLng], {
      icon: L.divIcon({
        className: 'end-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).bindPopup("🎯 Delivery Location").addTo(map);


    tankerMarker = L.marker([tankerLat, tankerLng], {
      icon: L.divIcon({
        html: '<div style="background: #34A853; border: 3px solid white; border-radius: 50%; width: 24px; height: 24px; box-shadow: 0 2px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>',
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      zIndexOffset: 1000
    }).bindPopup("🚛 Tanker Location").addTo(map);


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

 
    routingControl.on('routesfound', function(e) {
     
      if (isFirstRoute) {
      
        var bounds = L.latLngBounds([
          [startLat, startLng],
          [endLat, endLng],
          [tankerLat, tankerLng]
        ]);
        
        map.fitBounds(bounds, { padding: [50, 50] });
        isFirstRoute = false; 
      }
    });

   
    routingControl.on('routingerror', function(e) {
      // Only fit bounds on first route (for fallback too)
      if (isFirstRoute) {
     
        var bounds = L.latLngBounds([
          [startLat, startLng],
          [endLat, endLng],
          [tankerLat, tankerLng]
        ]);
        
        map.fitBounds(bounds, { padding: [50, 50] });
        isFirstRoute = false; // Set to false after first fit
      }
      
    
      showFallbackRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng);
    });
  }

  function showFallbackRoute(startLat, startLng, endLat, endLng, tankerLat, tankerLng) {
   
    var fallbackRoute = L.polyline([
      [startLat, startLng],
      [endLat, endLng]
    ], {
      color: '#4FC3F7',
      weight: 5,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);
    
  
    if (isFirstRoute) {
      // Create bounds to include all points
      var bounds = L.latLngBounds([
        [startLat, startLng],
        [endLat, endLng],
        [tankerLat, tankerLng]
      ]);
      
      map.fitBounds(bounds, { padding: [50, 50] });
      isFirstRoute = false;
    }
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


  map.setView([33.6588, 73.0709], 10);

 
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