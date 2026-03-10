// import { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
// import { api } from '../constants/api';
// import { ExtractedData, TextIngestRequest } from '../types';
// import { Ionicons } from '@expo/vector-icons';
// import * as DocumentPicker from 'expo-document-picker';
// import * as FileSystem from 'expo-file-system';

// export default function DataScreen() {
//     const [data, setData] = useState<ExtractedData[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedItem, setSelectedItem] = useState<ExtractedData | null>(null);

//     // Sync State
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [globalInstruction, setGlobalInstruction] = useState('');
//     const [processing, setProcessing] = useState(false);

//     const loadData = async () => {
//         try {
//             const result = await api.getData();
//             setData(result);
//         } catch (error) {
//             console.error('Failed to load data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadData();
//     }, []);

//     const handleMpesaSync = async () => {
//         if (!startDate || !endDate) {
//             Alert.alert('Error', 'Please enter a date range (YYYY-MM-DD)');
//             return;
//         }

//         setProcessing(true);

//         // Simulation
//         setTimeout(async () => {
//             const mockMessages: TextIngestRequest[] = [
//                 { text: 'QK123456 Confirmed. Ksh1000 sent to John Doe on 02/04/2025', source_type: 'mpesa' },
//                 { text: 'QK123457 Confirmed. Ksh500 received from Jane Doe on 03/04/2025', source_type: 'mpesa' },
//                 { text: 'QK123458 Confirmed. Ksh200 paid to KPLC on 03/04/2025', source_type: 'mpesa' },
//             ];

//             try {
//                 await api.ingestBatch(mockMessages);
//                 await loadData();
//                 Alert.alert('Success', `Synced ${mockMessages.length} messages`);
//             } catch (e) {
//                 Alert.alert('Error', 'Sync failed');
//             } finally {
//                 setProcessing(false);
//             }
//         }, 2000);
//     };

//     const handleFileUpload = async () => {
//         try {
//             const result = await DocumentPicker.getDocumentAsync({
//                 type: ['text/plain', 'text/csv'],
//                 copyToCacheDirectory: true,
//             });

//             if (result.canceled) return;

//             const file = result.assets[0];
//             setProcessing(true);

//             // Read file content
//             const content = await FileSystem.readAsStringAsync(file.uri);

//             // Simple line-based parsing
//             const lines = content.split('\n').filter(line => line.trim().length > 0);
//             const batchItems: TextIngestRequest[] = lines.map(line => ({
//                 text: line.trim(),
//                 source_type: 'mpesa'
//             }));

//             // Process in chunks
//             const chunkSize = 5;
//             for (let i = 0; i < batchItems.length; i += chunkSize) {
//                 const chunk = batchItems.slice(i, i + chunkSize);
//                 await api.ingestBatch(chunk, globalInstruction);
//             }

//             await loadData();
//             Alert.alert('Success', `Processed ${batchItems.length} items from file`);

//         } catch (error) {
//             console.error('File upload failed:', error);
//             Alert.alert('Error', 'Failed to process file');
//         } finally {
//             setProcessing(false);
//         }
//     };

//     const renderItem = ({ item }: { item: ExtractedData }) => (
//         <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)}>
//             <View style={styles.cardHeader}>
//                 <Text style={styles.idText}>#{item.id}</Text>
//                 <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
//             </View>
//             <Text numberOfLines={2} style={styles.rawText}>{item.raw_text}</Text>
//             <View style={styles.footer}>
//                 <Text style={styles.viewDetails}>View Details</Text>
//                 <Text style={styles.sourceType}>{item.source_type}</Text>
//             </View>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.container}>
//             <View style={styles.refreshContainer}>
//                 <TouchableOpacity onPress={loadData}>
//                     <Ionicons name="refresh" size={24} color="#007AFF" />
//                 </TouchableOpacity>
//             </View>

//             {/* Global Instructions Section */}
//             <View style={styles.syncCard}>
//                 <Text style={styles.cardTitle}>Global Instructions</Text>
//                 <TextInput
//                     style={[styles.input, styles.globalInstructionInput]}
//                     placeholder="e.g., Extract Amount and Date only..."
//                     value={globalInstruction}
//                     onChangeText={setGlobalInstruction}
//                     multiline
//                     numberOfLines={3}
//                     textAlignVertical="top"
//                 />
//             </View>

//             {/* File Upload Section */}
//             <View style={styles.syncCard}>
//                 <Text style={styles.cardTitle}>Upload File</Text>
//                 <Text style={styles.cardSubtitle}>Upload .txt or .csv files containing multiple messages.</Text>
//                 <TouchableOpacity
//                     style={[styles.syncButton, processing && styles.disabled]}
//                     onPress={handleFileUpload}
//                     disabled={processing}
//                 >
//                     {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Select File</Text>}
//                 </TouchableOpacity>
//             </View>

//             {/* Sync Section */}
//             <View style={styles.syncCard}>
//                 <Text style={styles.cardTitle}>M-Pesa Sync (Simulated)</Text>
//                 <View style={styles.row}>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Start Date (YYYY-MM-DD)"
//                         value={startDate}
//                         onChangeText={setStartDate}
//                     />
//                     <TextInput
//                         style={styles.input}
//                         placeholder="End Date"
//                         value={endDate}
//                         onChangeText={setEndDate}
//                     />
//                 </View>
//                 <TouchableOpacity
//                     style={[styles.syncButton, processing && styles.disabled]}
//                     onPress={handleMpesaSync}
//                     disabled={processing}
//                 >
//                     {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sync Messages</Text>}
//                 </TouchableOpacity>
//             </View>

//             {loading ? (
//                 <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
//             ) : (
//                 <FlatList
//                     data={data}
//                     renderItem={renderItem}
//                     keyExtractor={item => item.id.toString()}
//                     contentContainerStyle={styles.listContent}
//                     ListEmptyComponent={<Text style={styles.emptyText}>No data found.</Text>}
//                 />
//             )}

//             {/* Detail Modal */}
//             <Modal
//                 visible={!!selectedItem}
//                 animationType="slide"
//                 presentationStyle="pageSheet"
//                 onRequestClose={() => setSelectedItem(null)}
//             >
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalHeader}>
//                         <Text style={styles.modalTitle}>Transaction #{selectedItem?.id}</Text>
//                         <TouchableOpacity onPress={() => setSelectedItem(null)}>
//                             <Text style={styles.closeText}>Close</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <ScrollView style={styles.modalBody}>
//                         <View style={styles.detailSection}>
//                             <Text style={styles.detailLabel}>Raw Text</Text>
//                             <View style={styles.codeBlock}>
//                                 <Text style={styles.codeText}>{selectedItem?.raw_text}</Text>
//                             </View>
//                         </View>

//                         <View style={styles.detailSection}>
//                             <Text style={styles.detailLabel}>Extracted Data</Text>
//                             <View style={styles.codeBlock}>
//                                 <Text style={styles.codeText}>
//                                     {JSON.stringify(selectedItem?.extracted_json, null, 2)}
//                                 </Text>
//                             </View>
//                         </View>

//                         <View style={styles.detailSection}>
//                             <Text style={styles.detailLabel}>Metadata</Text>
//                             <Text>Date: {selectedItem && new Date(selectedItem.created_at).toLocaleString()}</Text>
//                             <Text>Source: {selectedItem?.source_type}</Text>
//                         </View>
//                     </ScrollView>
//                 </View>
//             </Modal>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     refreshContainer: {
//         padding: 16,
//         alignItems: 'flex-end',
//         backgroundColor: '#f5f5f5',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//     },
//     syncCard: {
//         margin: 16,
//         padding: 16,
//         backgroundColor: 'white',
//         borderRadius: 12,
//         elevation: 2,
//     },
//     cardTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 12,
//     },
//     cardSubtitle: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 12,
//     },
//     row: {
//         flexDirection: 'row',
//         gap: 8,
//         marginBottom: 12,
//     },
//     input: {
//         flex: 1,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         padding: 12,
//     },
//     globalInstructionInput: {
//         height: 80,
//         paddingTop: 12,
//     },
//     syncButton: {
//         backgroundColor: '#007AFF',
//         padding: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//     },
//     disabled: {
//         opacity: 0.7,
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: '600',
//     },
//     listContent: {
//         padding: 16,
//     },
//     card: {
//         backgroundColor: 'white',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 12,
//         elevation: 1,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 8,
//     },
//     idText: {
//         fontWeight: 'bold',
//         color: '#666',
//     },
//     dateText: {
//         color: '#999',
//         fontSize: 12,
//     },
//     rawText: {
//         fontSize: 14,
//         color: '#333',
//         marginBottom: 12,
//     },
//     footer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     viewDetails: {
//         color: '#007AFF',
//         fontWeight: '600',
//     },
//     sourceType: {
//         fontSize: 12,
//         color: '#999',
//         textTransform: 'uppercase',
//     },
//     emptyText: {
//         textAlign: 'center',
//         marginTop: 40,
//         color: '#666',
//     },
//     modalContainer: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     modalHeader: {
//         padding: 16,
//         backgroundColor: 'white',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderBottomWidth: 1,
//         borderBottomColor: '#eee',
//     },
//     modalTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     closeText: {
//         color: '#007AFF',
//         fontSize: 16,
//     },
//     modalBody: {
//         padding: 16,
//     },
//     detailSection: {
//         marginBottom: 24,
//     },
//     detailLabel: {
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 8,
//         color: '#333',
//     },
//     codeBlock: {
//         backgroundColor: '#e1e1e8',
//         padding: 12,
//         borderRadius: 8,
//     },
//     codeText: {
//         fontFamily: 'monospace',
//         fontSize: 14,
//     },
// });

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { api } from '../constants/api';
import { ExtractedData, TextIngestRequest } from '../types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

export default function DataScreen() {
    const [data, setData] = useState<ExtractedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ExtractedData | null>(null);

    // UI Toggle
    const [activeTab, setActiveTab] = useState<'tools' | 'data'>('tools');

    // Sync State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [globalInstruction, setGlobalInstruction] = useState('');
    const [processing, setProcessing] = useState(false);

    const loadData = async () => {
        try {
            setRefreshing(true);
            const result = await api.getData();
            setData(result);
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

    const handleMpesaSync = async () => {
        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please enter a date range (YYYY-MM-DD)');
            return;
        }

        setProcessing(true);

        setTimeout(async () => {
            const mockMessages: TextIngestRequest[] = [
                { text: 'QK123456 Confirmed. Ksh1000 sent to John Doe on 02/04/2025', source_type: 'mpesa' },
                { text: 'QK123457 Confirmed. Ksh500 received from Jane Doe on 03/04/2025', source_type: 'mpesa' },
                { text: 'QK123458 Confirmed. Ksh200 paid to KPLC on 03/04/2025', source_type: 'mpesa' },
            ];

            try {
                await api.ingestBatch(mockMessages);
                await loadData();
                Alert.alert('Success', `Synced ${mockMessages.length} messages`);
            } catch {
                Alert.alert('Error', 'Sync failed');
            } finally {
                setProcessing(false);
            }
        }, 2000);
    };

    const handleFileUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/plain', 'text/csv'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setProcessing(true);

            const content = await FileSystem.readAsStringAsync(file.uri);

            const lines = content.split('\n').filter(line => line.trim().length > 0);
            const batchItems: TextIngestRequest[] = lines.map(line => ({
                text: line.trim(),
                source_type: 'mpesa'
            }));

            const chunkSize = 5;
            for (let i = 0; i < batchItems.length; i += chunkSize) {
                const chunk = batchItems.slice(i, i + chunkSize);
                await api.ingestBatch(chunk, globalInstruction);
            }

            await loadData();
            Alert.alert('Success', `Processed ${batchItems.length} items from file`);

        } catch (error) {
            console.error('File upload failed:', error);
            Alert.alert('Error', 'Failed to process file');
        } finally {
            setProcessing(false);
        }
    };

    const renderItem = ({ item }: { item: ExtractedData }) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelectedItem(item)}>
            <View style={styles.cardHeader}>
                <Text style={styles.idText}>#{item.id}</Text>
                <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Text numberOfLines={2} style={styles.rawText}>{item.raw_text}</Text>
            <View style={styles.footer}>
                <Text style={styles.viewDetails}>View Details</Text>
                <Text style={styles.sourceType}>{item.source_type}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>

            {/* TOP BAR */}
            <View style={styles.topBar}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'tools' && styles.activeToggle]}
                        onPress={() => setActiveTab('tools')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'tools' && styles.activeToggleText]}>
                            Tools
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, activeTab === 'data' && styles.activeToggle]}
                        onPress={() => setActiveTab('data')}
                    >
                        <Text style={[styles.toggleText, activeTab === 'data' && styles.activeToggleText]}>
                            Data
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Refresh */}
                <TouchableOpacity onPress={loadData} disabled={refreshing}>
                    {refreshing ? (
                        <ActivityIndicator size={20} />
                    ) : (
                        <Ionicons name="refresh" size={26} color="#007AFF" />
                    )}
                </TouchableOpacity>
            </View>

            {/* ============================= */}
            {/* TOOLS TAB */}
            {/* ============================= */}
            {activeTab === 'tools' && (
                <ScrollView style={{ flex: 1 }}>

                    {/* Global Instructions */}
                    <View style={styles.syncCard}>
                        <Text style={styles.cardTitle}>Global Instructions</Text>
                        <TextInput
                            style={[styles.input, styles.globalInstructionInput]}
                            placeholder="e.g., Extract Amount and Date only..."
                            value={globalInstruction}
                            onChangeText={setGlobalInstruction}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Upload File */}
                    <View style={styles.syncCard}>
                        <Text style={styles.cardTitle}>Upload File</Text>
                        <Text style={styles.cardSubtitle}>Upload .txt or .csv files containing multiple messages.</Text>
                        <TouchableOpacity
                            style={[styles.syncButton, processing && styles.disabled]}
                            onPress={handleFileUpload}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Select File</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* Mpesa Sync */}
                    <View style={styles.syncCard}>
                        <Text style={styles.cardTitle}>M-Pesa Sync (Simulated)</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={styles.input}
                                placeholder="Start Date (YYYY-MM-DD)"
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="End Date"
                                value={endDate}
                                onChangeText={setEndDate}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.syncButton, processing && styles.disabled]}
                            onPress={handleMpesaSync}
                            disabled={processing}
                        >
                            {processing ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sync Messages</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* ============================= */}
            {/* TABLE TAB */}
            {/* ============================= */}
            {activeTab === 'data' && (
                loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No data found.</Text>}
                    />
                )
            )}

            {/* Modal */}
            <Modal
                visible={!!selectedItem}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedItem(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Transaction #{selectedItem?.id}</Text>
                        <TouchableOpacity onPress={() => setSelectedItem(null)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Raw Text</Text>
                            <View style={styles.codeBlock}>
                                <Text style={styles.codeText}>{selectedItem?.raw_text}</Text>
                            </View>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Extracted Data</Text>
                            <View style={styles.codeBlock}>
                                <Text style={styles.codeText}>
                                    {JSON.stringify(selectedItem?.extracted_json, null, 2)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Metadata</Text>
                            <Text>Date: {selectedItem && new Date(selectedItem.created_at).toLocaleString()}</Text>
                            <Text>Source: {selectedItem?.source_type}</Text>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    /* TOP BAR */
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },

    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#e5e5ea',
        padding: 4,
        borderRadius: 30,
    },

    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
    },

    activeToggle: {
        backgroundColor: '#007AFF',
    },

    toggleText: {
        color: '#555',
        fontWeight: '500',
    },

    activeToggleText: {
        color: 'white',
        fontWeight: '600',
    },

    syncCard: {
        margin: 16,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },

    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },

    row: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },

    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },

    globalInstructionInput: {
        height: 80,
        paddingTop: 12,
    },

    syncButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },

    disabled: {
        opacity: 0.7,
    },

    buttonText: {
        color: 'white',
        fontWeight: '600',
    },

    listContent: {
        padding: 16,
    },

    card: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    idText: {
        fontWeight: 'bold',
        color: '#666',
    },

    dateText: {
        color: '#999',
        fontSize: 12,
    },

    rawText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    viewDetails: {
        color: '#007AFF',
        fontWeight: '600',
    },

    sourceType: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#666',
    },

    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },

    modalHeader: {
        padding: 16,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    closeText: {
        color: '#007AFF',
        fontSize: 16,
    },

    modalBody: {
        padding: 16,
    },

    detailSection: {
        marginBottom: 24,
    },

    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },

    codeBlock: {
        backgroundColor: '#e1e1e8',
        padding: 12,
        borderRadius: 8,
    },

    codeText: {
        fontFamily: 'monospace',
        fontSize: 14,
    },
});

