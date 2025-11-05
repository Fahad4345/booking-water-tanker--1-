import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Platform, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const OpenMapButton = ({ location, position }) => {
    const openInMaps = () => {

        console.log('Opening location in maps:', location);
        if (!location) return;

        let url = '';

        if (typeof location === 'string') {
            // If location is an address
            url =
                Platform.OS === 'ios'
                    ? `http://maps.apple.com/?q=${encodeURIComponent(location)}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        } else if (typeof location === 'object' && location.lat && location.lng) {
            // If location is coordinates
            url =
                Platform.OS === 'ios'
                    ? `http://maps.apple.com/?ll=${location.lat},${location.lng}`
                    : `https://www.google.com/maps?q=${location.lat},${location.lng}`;
        }

        Linking.openURL(url).catch((err) => console.error('Failed to open map:', err));
    };

    return (
        <TouchableOpacity onPress={openInMaps} activeOpacity={0.8}>
            <View style={[styles.button, position]}>
                <Icon name="navigation" size={22} color="#FFF" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#4FC3F7",
        width: 50,
        height: 50,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#4FC3F7",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default OpenMapButton;
