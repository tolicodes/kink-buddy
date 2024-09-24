import React from 'react';
import moment from 'moment';
import { Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Markdown from 'react-native-markdown-display';
import * as amplitude from '@amplitude/analytics-react-native';


export const EventDetail = ({ route }: any) => {
    const selectedEvent = route?.params?.selectedEvent;
    if (!selectedEvent) return

    return (
        <ScrollView style={{ padding: 20 }}>
            <Image source={{ uri: selectedEvent.image_url }} style={styles.fullViewImage} />
            <TouchableOpacity onPress={() => {
                amplitude.logEvent('event_detail_link_clicked', { event_url: selectedEvent.event_url })
                Linking.openURL(selectedEvent.event_url)
            }}>
                <Text style={styles.fullViewTitle}>
                    {selectedEvent.name}
                    <MaterialIcons name="open-in-new" size={24} color="blue" />
                </Text>
            </TouchableOpacity>

            <Text style={styles.eventOrganizer}>{selectedEvent.organizer.name}</Text>

            <Text style={styles.eventTime}>
                {`${moment(selectedEvent.start_date).format('MMM D, YYYY')} ${moment(selectedEvent.start_date).format('hA')} - ${moment(selectedEvent.end_date).format('hA')}`}
            </Text>

            {selectedEvent.price && <Text style={styles.fullViewPrice}>
                {selectedEvent.price}
            </Text>}
            <Markdown>
                {selectedEvent.description}
            </Markdown>
        </ScrollView>)
}

const styles = StyleSheet.create({
    fullViewContainer: {
        position: 'relative',
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        padding: 20,
    },
    fullViewImage: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
    fullViewTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'blue',
    },
    fullViewTime: {
        fontSize: 18,
        color: 'black',
    },
    fullViewLocation: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
    },
    fullViewPrice: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
    },
    eventOrganizer: {
        fontSize: 14,
        color: 'black',
    },
    eventTime: {
        fontSize: 14,
        color: '#666',
    },
})