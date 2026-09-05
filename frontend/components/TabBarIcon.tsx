import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: React.ComponentProps<typeof FontAwesome>['color'];
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
