import { Armchair, Bath, BedDouble, Building2, Car, Compass, House, Map as MapIcon, Route, Ruler } from 'lucide-react'
import { formatMeasurement, titleCase } from '../../utils/format'

function fact(icon, label, value) {
  if (value === null || value === undefined || value === '') return null
  return { icon, label, value }
}

export function getPropertyFacts(property, { detailed = false } = {}) {
  const landArea = formatMeasurement(property.landAreaValue ?? property.land_area_value, property.landAreaUnit || property.land_area_unit)
  const builtArea = formatMeasurement(property.builtUpAreaValue ?? property.built_up_area_value, property.builtUpAreaUnit || property.built_up_area_unit)
  const type = property.propertyType || property.property_type

  if (type === 'land') {
    const road = property.road_access_value
      ? `${property.road_access_value} ${property.road_access_unit || ''}`.trim()
      : titleCase(property.road_type)
    return [
      fact(MapIcon, 'Land area', landArea),
      fact(Route, 'Road access', road),
      fact(Compass, 'Facing direction', property.facing_direction_display || titleCase(property.facing_direction)),
      detailed && fact(MapIcon, 'Land classification', titleCase(property.land_use_classification)),
    ].filter(Boolean)
  }

  if (['commercial', 'office_space'].includes(type)) {
    return [
      fact(Ruler, 'Usable area', builtArea || landArea),
      fact(Car, 'Parking spaces', property.parking_spaces ? `${property.parking_spaces}` : titleCase(property.parking_type)),
      fact(Armchair, 'Furnishing', property.furnishing_status_display || titleCase(property.furnishing_status)),
      detailed && fact(Building2, 'Property type', property.propertyTypeLabel || titleCase(type)),
    ].filter(Boolean)
  }

  return [
    fact(BedDouble, 'Bedrooms', Number(property.beds) > 0 ? property.beds : null),
    fact(Bath, 'Bathrooms', Number(property.baths) > 0 ? property.baths : null),
    fact(Ruler, builtArea ? 'Built-up area' : 'Land area', builtArea || landArea),
    detailed && fact(House, 'Property type', property.propertyTypeLabel || titleCase(type)),
  ].filter(Boolean)
}
