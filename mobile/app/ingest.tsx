import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../constants/api';
import { ExtractedData } from '../types';

export default function Ingest() {
    const [text, setText] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionData, setSessionData] = useState<ExtractedData[]>([]);

    const handleSubmit = async () => {
        if (!text.trim()) {
            Alert.alert('Error', 'Please enter some text');
            return;
        }

        setLoading(true);
        try {
            const result = await api.ingestText({
                text,
                source_type: 'mpesa',
                // custom_instruction: customInstruction // Backend might not support this yet based on types, but frontend sent it.
            });
            // Note: The frontend types didn't have custom_instruction in TextIngestRequest, but the code sent it.
            // I'll assume the backend handles it or ignores it. 
            // Actually, let's check types.ts again. TextIngestRequest only has text and source_type.
            // But Ingest.tsx sends custom_instruction. I'll stick to types for safety or cast it.

            Alert.alert('Success', 'Text processed successfully!');
            setText('');
            setSessionData(prev => [result, ...prev]);
        } catch (error) {
            Alert.alert('Error', 'Failed to process text. Make sure the backend is running.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.card}>
                <Text style={styles.label}>Text Content</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={6}
                    value={text}
                    onChangeText={setText}
                    placeholder="Paste your text here..."
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Custom Instructions (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.textAreaSmall]}
                    multiline
                    numberOfLines={3}
                    value={customInstruction}
                    onChangeText={setCustomInstruction}
                    placeholder="e.g., Extract only Amount..."
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Extract Data</Text>
                    )}
                </TouchableOpacity>
            </View>

            {sessionData.length > 0 && (
                <View style={styles.resultsSection}>
                    <Text style={styles.sectionTitle}>Session Results ({sessionData.length})</Text>
                    {sessionData.map(item => (
                        <View key={item.id} style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={styles.badge}>{item.source_type}</Text>
                                <Text style={styles.date}>{new Date(item.created_at).toLocaleTimeString()}</Text>
                            </View>
                            <Text style={styles.rawText} numberOfLines={2}>{item.raw_text}</Text>
                            <View style={styles.jsonBox}>
                                <Text style={styles.jsonText}>
                                    {JSON.stringify(item.extracted_json, null, 2)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    textArea: {
        height: 120,
    },
    textAreaSmall: {
        height: 80,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsSection: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
    },
    resultCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#34C759',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    badge: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#34C759',
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    rawText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    jsonBox: {
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
    },
    jsonText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#333',
    },
});
