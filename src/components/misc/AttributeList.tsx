import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type AttributeListProps = {
  attributes?: Record<string, any>
  indent?: number
}

/**
 * 🔍 Zeigt beliebig verschachtelte Attribute schön formatiert an
 *  → erkennt automatisch Objekte und Arrays
 */
const AttributeList: React.FC<AttributeListProps> = ({ attributes, indent = 0 }) => {
  if (!attributes || typeof attributes !== 'object') return null

  return (
    <View style={{ marginLeft: indent }}>
      {Object.entries(attributes).map(([key, value]) => {
        const displayKey = key.replace(/_/g, ' ')
        const isObject = typeof value === 'object' && value !== null
        const isArray = Array.isArray(value)

        return (
          <View key={key} style={styles.attributeContainer}>
            <Text style={styles.keyText}>{displayKey}</Text>
            {isObject && !isArray && (
              <AttributeList attributes={value} indent={indent + 12} />
            )}
            {isArray && (
              <View style={styles.arrayContainer}>
                {value.map((item, index) => (
                  <View key={index} style={styles.arrayItem}>
                    {typeof item === 'object' ? (
                      <AttributeList attributes={item} indent={indent + 12} />
                    ) : (
                      <Text style={styles.valueText}>{String(item)}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            {!isObject && !isArray && (
              <Text style={styles.valueText}>{String(value)}</Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  attributeContainer: {
    marginVertical: 4,
  },
  keyText: {
    fontWeight: '600',
    color: '#222',
  },
  valueText: {
    color: '#555',
    marginLeft: 8,
  },
  arrayContainer: {
    marginTop: 4,
    marginLeft: 12,
  },
  arrayItem: {
    marginBottom: 2,
  },
})

export default AttributeList
