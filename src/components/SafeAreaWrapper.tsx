import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

interface SafeAreaWrapperProps {
    children: React.ReactNode;
}

const SafeAreaWrapper = ({ children }: SafeAreaWrapperProps) => {
    return (
        <>
           
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {children}
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
});

export default SafeAreaWrapper;
