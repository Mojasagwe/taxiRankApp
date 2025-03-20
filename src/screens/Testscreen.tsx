import React, { useState } from 'react';
import { Text, Button, ScrollView } from 'react-native';
import api from '../services/api/axios';
import { styles } from '../styles/testScreen.styles';

// Define types for your data
interface Rank {
    id: number;
    name: string;
    // add other properties from your backend
}

const TestScreen: React.FC = () => {
    const [data, setData] = useState<Rank[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const testBackendConnection = async () => {
        try {
            setError(null);
            const response = await api.get<Rank[]>('/ranks');
            setData(response.data);
            console.log('Response:', response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error:', err);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Backend Connection Test</Text>
            <Button
                title="Test Connection"
                onPress={testBackendConnection}
            />

            {error && (
                <Text style={styles.error}>
                    Error: {error}
                </Text>
            )}

            {data && (
                <Text style={styles.data}>
                    Response: {JSON.stringify(data, null, 2)}
                </Text>
            )}
        </ScrollView>
    );
};

export default TestScreen;
