import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useUserContext } from './UserContext';
import { useNavigation } from '@react-navigation/native';

export default function Account() {
    const { userProfile, signOut, } = useUserContext();
    const { goBack } = useNavigation();
    const onPressSignOut = async () => {
        signOut(goBack);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.emailText}>Logged in As: {userProfile?.email}</Text>
            <Text>Wishlist Share Code: {userProfile?.share_code}</Text>
            <Button title="Sign Out" onPress={onPressSignOut} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
        alignItems: 'center',
    },
    emailText: {
        fontSize: 16,
        marginBottom: 20,
    },
});