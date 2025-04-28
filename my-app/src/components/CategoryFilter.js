import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Display names for categories
const displayNames = {
  Mathematics: 'Math',
  PoliticalScience: 'Political Science',
  ComputerScience: 'Computer Science',
  EnvironmentalScience: 'Environmental Science',
  QuantumMechanics: 'Quantum Mechanics',
  Thermodynamics: 'Thermodynamics',
  OrganicChemistry: 'Organic Chemistry',
  InorganicChemistry: 'Inorganic Chemistry',
  ArtificialIntelligence: 'AI',
  MachineLearning: 'Machine Learning',
  DataScience: 'Data Science',
  GameDesign: 'Game Design',
  Neuroscience: 'Brain Science',
  Ecology: 'Ecology',
  Zoology: 'Zoology (Animals)',
  Botany: 'Botany (Plants)',
  Astrophysics: 'Astrophysics',
  Microbiology: 'Microbiology',
  Statistics: 'Statistics',
  Photography: 'Photography',
  Architecture: 'Architecture',
  Cybersecurity: 'Cybersecurity',
  Theater: 'Theatre',
  Film: 'Film & Cinema',
};

// Pastel palette (cute but visible on light background)
const pastelColors = [
  '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
  '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff',
  '#ccccc9'
];

// Mapping of category name to color
const categoryColorMap = {};

function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  // Create color mapping once when categories load
  useMemo(() => {
    categories.forEach((cat, index) => {
      if (cat.category_name && cat.category_name !== 'category_name') {
        categoryColorMap[cat.category_name] = pastelColors[index % pastelColors.length];
      }
    });
  }, [categories]);

  const selected = categories.filter(cat => selectedCategories.includes(cat.category_id) && cat.category_name !== 'category_name');
  const unselected = categories.filter(cat => !selectedCategories.includes(cat.category_id) && cat.category_name !== 'category_name');

  const renderPill = (cat, isSelected) => {
    const pastelColor = categoryColorMap[cat.category_name] || '#e0f2fe';
    return (
      <motion.div
        key={cat.category_id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundColor: pastelColor,
          borderRadius: '999px',
          padding: '8px 14px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#333',
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: isSelected
            ? '0 0 0 2px #333 inset'
            : '0 2px 6px rgba(0, 0, 0, 0.08)',
          opacity: isSelected ? 1 : 0.9,
        }}
        onClick={() => toggleCategory(cat.category_id)}
      >
        {displayNames[cat.category_name] || cat.category_name}
        {isSelected && (
          <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>✕</span>
        )}
      </motion.div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
        <AnimatePresence>
          {selected.map(cat => renderPill(cat, true))}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <AnimatePresence>
          {unselected.map(cat => renderPill(cat, false))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { categoryColorMap };
export default CategoryFilter;
