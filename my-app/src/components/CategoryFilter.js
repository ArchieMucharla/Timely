function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      {categories.map((cat) => (
        <label key={cat.category_id}>
          <input
            type="checkbox"
            value={cat.category_id}
            checked={selectedCategories.includes(cat.category_id)}
            onChange={() => toggleCategory(cat.category_id)}
          />
          {cat.category_name}
        </label>
      ))}
    </div>
  );
}

export default CategoryFilter;
