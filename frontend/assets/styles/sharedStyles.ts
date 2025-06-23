// src/styles/SharedHeaderStyles.ts
import { StyleSheet } from 'react-native';

export const SharedHeaderStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#6B7280',
        fontFamily: 'PlusJakartaSans-Regular',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        fontFamily: 'PlusJakartaSans-Regular',
        marginBottom: 15,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: 30,
        fontSize: 16,
        color: '#6B7280',
        fontFamily: 'PlusJakartaSans-Regular',
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Regular',
        color: '#6B7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        // elevation: 2,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.1,
        // shadowRadius: 2,
    },
    header2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
        color: '#1F2937',
    },
    publishButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingVertical: 14,
        alignItems: 'center',
        margin: 16,
    },
    publishButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    cancelButton: {
        fontSize: 16,
        color: 'red',
        fontFamily: 'PlusJakartaSans-Bold'
    },

});
