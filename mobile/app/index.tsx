import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../constants/api';
import { ExtractedData } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0,
        mpesa: 0,
    });
    const [recentData, setRecentData] = useState<ExtractedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const data = await api.getData();
            setRecentData(data.slice(0, 5));

            const counts = {
                total: data.length,
                mpesa: data.filter(d => d.source_type === 'mpesa').length,
            };
            setStats(counts);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        // <SafeAreaView style={styles.safeContainer}>
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.bgBlue]}>
                    <Text style={styles.statIcon}>📊</Text>
                    <View>
                        <Text style={styles.statLabel}>Total Records</Text>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                    </View>
                </View>

                <View style={[styles.statCard, styles.bgGreen]}>
                    <Text style={styles.statIcon}>💰</Text>
                    <View>
                        <Text style={styles.statLabel}>M-Pesa</Text>
                        <Text style={styles.statNumber}>{stats.mpesa}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Extractions</Text>
                {recentData.length > 0 ? (
                    recentData.map(item => (
                        <View key={item.id} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.badge, item.source_type === 'mpesa' ? styles.badgeMpesa : styles.badgeDefault]}>
                                    <Text style={styles.badgeText}>{item.source_type}</Text>
                                </View>
                                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                            </View>
                            <Text numberOfLines={2} style={styles.cardText}>{item.raw_text}</Text>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No data yet. Start by ingesting some text!</Text>
                    </View>
                )}
            </View>
        </ScrollView>
        // </SafeAreaView> 
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    bgBlue: {
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    bgGreen: {
        borderLeftWidth: 4,
        borderLeftColor: '#34C759',
    },
    statIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    badgeMpesa: {
        backgroundColor: '#e8f5e9',
    },
    badgeDefault: {
        backgroundColor: '#f5f5f5',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    cardText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    emptyText: {
        color: '#666',
    },
});

