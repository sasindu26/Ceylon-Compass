import React from 'react';
import Select from 'react-select';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  isDisabled = false,
  isClearable = false,
  name,
  isSearchable = true 
}) => {
  // Convert options to react-select format
  const selectOptions = options.map(option => ({
    value: option,
    label: option
  }));

  // Find the selected option
  const selectedOption = selectOptions.find(opt => opt.value === value) || null;

  // Handle change
  const handleChange = (selectedOption) => {
    // Create a synthetic event to match native select behavior
    const syntheticEvent = {
      target: {
        name: name,
        value: selectedOption ? selectedOption.value : ''
      }
    };
    onChange(syntheticEvent);
  };

  // Custom styles to match your existing design
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      padding: '0.35rem 0.5rem',
      border: state.isFocused ? '2px solid var(--primary, #2563eb)' : '1px solid var(--border, #e2e8f0)',
      borderRadius: '8px',
      backgroundColor: isDisabled ? '#f1f5f9' : 'var(--white, #ffffff)',
      color: 'var(--text-dark, #1e293b)',
      fontSize: '1rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'var(--shadow-sm)',
      cursor: isDisabled ? 'not-allowed' : 'default',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: isDisabled ? 'var(--border, #e2e8f0)' : 'var(--primary, #2563eb)'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--text-dark, #1e293b)',
      margin: 0,
      padding: 0
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--text-light, #64748b)',
      fontSize: '1rem'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-dark, #1e293b)',
      fontSize: '1rem'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: 'var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 0.05))',
      border: '1px solid var(--border, #e2e8f0)',
      marginTop: '4px',
      zIndex: 9999
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '250px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--primary, #2563eb)' 
        : state.isFocused 
          ? 'var(--primary-light, rgba(37, 99, 235, 0.1))' 
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-dark, #1e293b)',
      cursor: 'pointer',
      fontSize: '1rem',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 0',
      transition: 'all 0.2s ease',
      '&:active': {
        backgroundColor: 'var(--primary, #2563eb)'
      }
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? 'var(--primary, #2563eb)' : 'var(--text-light, #64748b)',
      padding: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: 'var(--primary, #2563eb)'
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--text-light, #64748b)',
      padding: '4px',
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--error, #ef4444)'
      }
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'var(--border, #e2e8f0)'
    })
  };

  return (
    <Select
      options={selectOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable={isClearable}
      isSearchable={isSearchable}
      styles={customStyles}
      classNamePrefix="react-select"
      noOptionsMessage={() => "No options found"}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
};

export default SearchableSelect;
