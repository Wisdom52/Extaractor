import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { api } from '../constants/api';
import { TriggerWord } from '../types';
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
    const [triggerWords, setTriggerWords] = useState<TriggerWord[]>([]);
    const [newWord, setNewWord] = useState('');
    const [category, setCategory] = useState('urgent');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const categories = ['urgent', 'spam', 'positive', 'negative', 'custom'];

    useEffect(() => {
        loadTriggerWords();
    }, []);

    const loadTriggerWords = async () => {
        try {
            const words = await api.getTriggerWords();
            setTriggerWords(words);
        } catch (error) {
            console.error('Failed to load trigger words:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newWord.trim()) return;

        setAdding(true);
        try {
            await api.createTriggerWord({ word: newWord, category });
            setNewWord('');
            setCategory('urgent');
            await loadTriggerWords();
            Alert.alert('Success', 'Trigger word added');
        } catch (error) {
            Alert.alert('Error', 'Failed to add trigger word');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Delete Trigger',
            'Are you sure you want to delete this trigger word?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteTriggerWord(id);
                            await loadTriggerWords();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete trigger word');
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Add New Trigger</Text>

                <Text style={styles.label}>Trigger Word</Text>
                <TextInput
                    style={styles.input}
                    value={newWord}
                    onChangeText={setNewWord}
                    placeholder="e.g., urgent"
                />

                <Text style={styles.label}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                category === cat && styles.categoryChipSelected
                            ]}
                            onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                category === cat && styles.categoryTextSelected
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.addButton, adding && styles.disabled]}
                    onPress={handleAdd}
                    disabled={adding}
                >
                    {adding ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>+ Add Trigger</Text>}
                </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
                <Text style={styles.sectionTitle}>Active Triggers</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" />
                ) : triggerWords.length > 0 ? (
                    triggerWords.map(trigger => (
                        <View key={trigger.id} style={styles.triggerItem}>
                            <View>
                                <Text style={styles.triggerWord}>{trigger.word}</Text>
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{trigger.category}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(trigger.id)}>
                                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No trigger words defined yet.</Text>
                    </View>
                )}
            </View>
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
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
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryText: {
        color: '#333',
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: 'white',
    },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    listSection: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#1a1a1a',
    },
    triggerItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    triggerWord: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    badgeContainer: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        color: '#007AFF',
        textTransform: 'capitalize',
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
