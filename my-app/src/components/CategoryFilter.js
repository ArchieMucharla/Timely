import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


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

function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  const pastelColors = useMemo(
    () => [
      '#ffe0f0', '#d8f3dc', '#fef9c3', '#cce5ff', '#fce1e4',
      '#e0f7fa', '#e9d8fd', '#fde2e4', '#e0ffe0'
    ],
    []
  );

  const selected = categories.filter(cat => selectedCategories.includes(cat.category_id) && cat.category_name !== 'category_name');
  const unselected = categories.filter(cat => !selectedCategories.includes(cat.category_id) && cat.category_name !== 'category_name');
  const renderPill = (cat, isSelected) => {
    const pastelColor = pastelColors[parseInt(cat.category_id) % pastelColors.length];
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
          opacity: isSelected ? 1 : 0.85,
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


export default CategoryFilter;
