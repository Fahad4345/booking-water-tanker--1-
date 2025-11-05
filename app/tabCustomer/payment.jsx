import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StatusBar,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BookTank } from '../../api/bookings/BookTank';
import EventBus from '../../utils/EventBus';

export default function PaymentScreen() {
    const router = useRouter();
    const { bookingDetail, userEmail } = useLocalSearchParams();
    const bookingDetails = bookingDetail ? JSON.parse(bookingDetail) : null;


    const { confirmPayment } = useStripe();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handlePayment = async () => {
        if (!cardComplete) {
            Alert.alert('Incomplete Card Details', 'Please enter valid card information');
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch('http://192.168.100.187:5000/stripe/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: bookingDetails.priceNumeric,
                    customerEmail: userEmail,
                    bookingId: bookingDetails._id,
                }),
            });

            const { clientSecret } = await response.json();

            if (!clientSecret) throw new Error("No client secret received from backend");

            const { error, paymentIntent } = await confirmPayment(clientSecret, {
                paymentMethodType: 'Card',
            });

            if (error) {
                Alert.alert('Payment Failed', error.message);
                setIsProcessing(false);
            } else if (paymentIntent) {
                const result = await BookTank(bookingDetails);
                if (result.success) {
                    Alert.alert(
                        'Payment Successful! 🎉',
                        'Your booking has been confirmed.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    EventBus.emit('orderUpdated');
                                    router.push('/tabCustomer');
                                },
                            },
                        ]
                    );

                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            Alert.alert('Payment Error', 'Unable to process payment. Please try again.');
            setIsProcessing(false);
        }
    };

    if (!bookingDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ padding: 16 }}>No booking details found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={styles.headerRight} />
            </View>

            {/* KeyboardAvoidingView handles keyboard overlapping */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // adjust offset as needed
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>


                    <View style={styles.content}>
                        {/* Order Summary Card */}
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <Ionicons name="receipt-outline" size={24} color="#1976D2" />
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tanker Size</Text>
                                <Text style={styles.summaryValue}>{bookingDetails?.tankSize}L</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Supplier</Text>
                                <Text style={styles.summaryValue}>{bookingDetails?.supplierName}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Type</Text>
                                <Text style={styles.summaryValue}>{bookingDetails?.bookingType}</Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Location</Text>
                                <Text style={[styles.summaryValue, styles.locationText]} numberOfLines={1}>
                                    {bookingDetails?.dropLocation}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>{bookingDetails?.price}</Text>
                            </View>
                        </View>

                        {/* Payment Section */}
                        <View style={styles.paymentSection}>
                            <View style={styles.paymentHeader}>
                                <Ionicons name="card-outline" size={22} color="#333" />
                                <Text style={styles.paymentTitle}>Card Details</Text>
                            </View>

                            <Text style={styles.paymentSubtitle}>
                                Enter your card information securely
                            </Text>

                            <View style={styles.cardFieldContainer}>
                                <CardField
                                    postalCodeEnabled={false}
                                    placeholder={{ number: '4242 4242 4242 4242' }}
                                    cardStyle={{
                                        backgroundColor: '#FFFFFF',
                                        textColor: '#000000',
                                        placeholderColor: '#999999',
                                        borderWidth: 1,
                                        borderColor: '#e0e0e0',
                                        borderRadius: 8,
                                    }}
                                    style={styles.cardField}
                                    onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
                                />
                            </View>

                            <View style={styles.securityBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                                <Text style={styles.securityText}>
                                    Your payment is secured by Stripe
                                </Text>
                            </View>
                        </View>


                    </View>

                    {/* Bottom Payment Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.payButton, (!cardComplete || isProcessing) && styles.payButtonDisabled]}
                            onPress={handlePayment}
                            disabled={!cardComplete || isProcessing}
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="lock-closed" size={20} color="#fff" />
                                    <Text style={styles.payButtonText}>Pay {bookingDetails?.price}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={isProcessing}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Keep your existing styles here unchanged


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1976D2',
        paddingHorizontal: 16,
        paddingVertical: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerRight: {
        width: 32,
    },
    content: {
        flex: 1,
        padding: 16,
        height: '100%',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    locationText: {
        fontSize: 13,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1976D2',
    },
    paymentSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginLeft: 8,
    },
    paymentSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    cardFieldContainer: {
        marginBottom: 12,
    },
    cardField: {
        width: '100%',
        height: 50,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
    },
    securityText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
        marginLeft: 6,
    },
    testCardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    testCardText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    payButton: {
        backgroundColor: '#4CAF50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    payButtonDisabled: {
        backgroundColor: '#ccc',
        elevation: 0,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
});