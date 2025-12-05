import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function Layout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarStyle: {
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                },
                headerStyle: {
                    backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                },
                headerTintColor: isDark ? '#ffffff' : '#000000',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ingest"
                options={{
                    title: 'Ingest',
                    tabBarIcon: ({ color, size }) => <Ionicons name="download" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="data"
                options={{
                    title: 'Data',
                    tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
