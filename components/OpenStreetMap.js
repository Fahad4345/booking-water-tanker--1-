// ...existing code...
import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

export default function OpenStreetMapView({ onLocationSelect, address }) {
  const webviewRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const pendingAddressRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Get user's current location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
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

  // Helper to safely post message to WebView
  const postToWebView = (obj) => {
    try {
      if (webviewRef.current && webviewRef.current.postMessage) {
        webviewRef.current.postMessage(JSON.stringify(obj));
      } else {
        // keep the last message in pending if webview not available yet
        pendingAddressRef.current = obj;
      }
    } catch (e) {
      console.error("postToWebView error:", e);
    }
  };

  // When both userLocation and webview ready -> send user location
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

  // If we had a pending message queued before webview ready, flush it
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

  // Debounced handling of address prop changes (updates as user types)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If no address provided, do nothing
    if (!address || address.trim().length === 0) {
      return;
    }

    // Debounce geocoding to avoid many requests while typing
    debounceTimerRef.current = setTimeout(() => {
      // If looks like coords -> move immediately
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

      // If webview not ready yet, store the request and it will be sent when ready
      if (!isWebViewReady) {
        pendingAddressRef.current = { type: "GEOCODE_AND_MOVE", address };
        return;
      }

      // Otherwise geocode now and move the map
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

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .center-pin {
          position: absolute;
          top: 50%;
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
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="center-pin"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([33.6844, 73.0479], 13);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var userMarker = null;
        var accuracyCircle = null;

        map.on('moveend', function() {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "MAP_MOVED",
            lat: center.lat.toFixed(6),
            lng: center.lng.toFixed(6)
          }));
        });

        function moveTo(lat, lng) {
          try {
            map.setView([lat, lng], 15);
          } catch(e) {
            console.error('moveTo error', e);
          }
        }

        function showUserLocation(lat, lng) {
          // Remove old markers
          if (userMarker) map.removeLayer(userMarker);
          if (accuracyCircle) map.removeLayer(accuracyCircle);
          
          // Add accuracy circle
          accuracyCircle = L.circle([lat, lng], {
            radius: 50,
            color: "#4285F4",
            fillColor: "#4285F4",
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(map);
          
          // Add user marker (blue dot)
          userMarker = L.circleMarker([lat, lng], {
            radius: 8,
            color: "#FFFFFF",
            fillColor: "#4285F4",
            fillOpacity: 1,
            weight: 3,
          }).addTo(map);
        }

        function handleMessage(data) {
          try {
            console.log('Web content received:', data);
            if (!data || !data.type) return;

            if (data.type === "MOVE_TO") {
              moveTo(data.lat, data.lng);
            } else if (data.type === "USER_LOCATION") {
              showUserLocation(data.lat, data.lng);
              moveTo(data.lat, data.lng);
            } else if (data.type === "GEOCODE_AND_MOVE") {
              // The native side requested a geocode -> we don't geocode here,
              // native will geocode and send MOVE_TO, but keep for compatibility.
            }
          } catch (e) {
            console.error('handleMessage error', e);
          }
        }

        // Support both document and window message events for RN WebView compatibility
        document.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });
        window.addEventListener('message', function(e) {
          try { handleMessage(JSON.parse(e.data)); } catch(err) { console.error(err); }
        });

        // Notify React Native that WebView is ready
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
            // console.log("Message from WebView:", data);

            if (data.type === "WEBVIEW_READY") {
              setIsWebViewReady(true);
              // If we had a queued GEOCODE_AND_MOVE request, handle it now:
              if (
                pendingAddressRef.current &&
                pendingAddressRef.current.type === "GEOCODE_AND_MOVE"
              ) {
                geocodeAddress(pendingAddressRef.current.address);
                pendingAddressRef.current = null;
              }
            } else if (data.type === "MAP_MOVED" && data.lat && data.lng) {
              const address = await getAddressFromCoords(data.lat, data.lng);
              onLocationSelect?.({
                lat: data.lat,
                lng: data.lng,
                address: address,
              });
            }
          } catch (error) {
            console.error("Error handling message:", error);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
// ...existing code...
