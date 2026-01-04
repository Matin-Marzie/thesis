import { StyleSheet, Dimensions } from 'react-native';
import { GREEN, height } from '../gameConstants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const popupStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: '#fff',
        borderRadius: 15,
        width: SCREEN_WIDTH * 0.85,
        height: height * 0.6,
        overflow: 'hidden',
    },
    popupHeader: {
        backgroundColor: GREEN,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    placeholder: {
        width: 30,
    },
    headerText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        color: '#000',
        size: 24,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 2,
        height: '100%',
    },
});
