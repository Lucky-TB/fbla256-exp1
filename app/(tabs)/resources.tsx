import React from 'react'
import { Text, View, StyleSheet } from 'react-native'

const resources = () => {
  return (
    <View>
      <Text style={styles.text}>resources</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'ApercuPro-Regular',
  },
})

export default resources