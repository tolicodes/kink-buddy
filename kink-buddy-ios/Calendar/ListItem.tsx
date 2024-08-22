import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Event } from './types';
import moment from 'moment';
export const ListItem = ({ item, setSelectedEvent, slideIn }: { item: Event, setSelectedEvent: (event: Event) => void, slideIn: () => void }) => {
    const formattedDate = `${moment(item.start_date).format('hA')} - ${moment(item.end_date).format('hA')}`;

    return (
        <TouchableOpacity onPress={() => {
            setSelectedEvent(item);
            slideIn();

        }}>
            <View style={styles.eventContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
                <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle}>{item.name}</Text>
                    <Text style={styles.eventOrganizer}>{item.organizer}</Text>
                    <Text style={styles.eventTime}>{formattedDate}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    eventContainer: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    eventDetails: {
        flex: 1,
    },
    eventImage: {
        width: 50,
        height: 50,
        marginRight: 16,
    },

    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    eventOrganizer: {
        fontSize: 14,
        color: 'black',
    },
    eventTime: {
        fontSize: 14,
        color: '#666',
    },
});