import React, { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select as ChakraSelect,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  Box,
} from '@chakra-ui/react';

/**
 * Composant de sélecteur (dropdown) personnalisé
 * @param {Object} props - Propriétés du composant
 * @param {string} props.name - Nom du champ dans le formulaire
 * @param {string} [props.label] - Libellé du champ
 * @param {Array} props.options - Tableau d'options {value: any, label: string} ou tableau de chaînes
 * @param {string} [props.placeholder='Sélectionnez une option'] - Texte d'aide dans le champ
 * @param {boolean} [props.isRequired=false] - Si le champ est obligatoire
 * @param {string} [props.helperText] - Texte d'aide sous le champ
 * @param {React.ReactNode} [props.leftIcon] - Icône à gauche du champ
 * @param {React.ReactNode} [props.rightIcon] - Icône à droite du champ
 * @param {Object} [props.rules] - Règles de validation supplémentaires
 * @param {boolean} [props.isDisabled=false] - Si le champ est désactivé
 * @param {boolean} [props.isLoading=false] - Si les options sont en cours de chargement
 * @param {string} [props.size='md'] - Taille du champ (sm, md, lg)
 * @param {function} [props.optionLabel] - Fonction pour personnaliser l'affichage des options
 * @param {function} [props.optionValue] - Fonction pour personnaliser la valeur des options
 * @param {Object} [props.selectProps] - Propriétés supplémentaires pour le composant Select
 * @returns {JSX.Element} Composant de sélecteur
 */
const SelectInput = ({
  name,
  label,
  options = [],
  placeholder = 'Sélectionnez une option',
  isRequired = false,
  helperText,
  leftIcon,
  rightIcon,
  rules = {},
  isDisabled = false,
  isLoading = false,
  size = 'md',
  optionLabel = 'label',
  optionValue = 'value',
  selectProps = {},
  ...rest
}) => {
  const { control, formState: { errors } } = useFormContext();
  
  // Normalisation des options
  const normalizedOptions = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'string') {
        return { value: option, label: option };
      }
      return {
        value: typeof optionValue === 'function' 
          ? optionValue(option) 
          : option[optionValue],
        label: typeof optionLabel === 'function'
          ? optionLabel(option)
          : option[optionLabel],
        original: option,
      };
    });
  }, [options, optionLabel, optionValue]);

  // Règles de validation
  const validationRules = {
    required: isRequired ? 'Ce champ est obligatoire' : false,
    ...rules,
  };

  return (
    <FormControl 
      id={name} 
      isInvalid={!!errors?.[name]} 
      isRequired={isRequired}
      isDisabled={isDisabled}
      {...rest}
    >
      {label && (
        <FormLabel htmlFor={name} mb={1} fontSize="sm" fontWeight="medium" color="gray.700">
          {label}
        </FormLabel>
      )}
      
      <InputGroup size={size}>
        {leftIcon && (
          <InputLeftElement pointerEvents="none">
            {typeof leftIcon === 'string' ? (
              <Icon as={leftIcon} color="gray.400" />
            ) : (
              leftIcon
            )}
          </InputLeftElement>
        )}
        
        <Controller
          name={name}
          control={control}
          rules={validationRules}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <ChakraSelect
              ref={ref}
              id={name}
              placeholder={isLoading ? 'Chargement...' : placeholder}
              isDisabled={isDisabled || isLoading}
              isInvalid={!!errors?.[name]}
              onChange={onChange}
              onBlur={onBlur}
              value={value || ''}
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: 'blue.300' }}
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px #3182ce',
              }}
              _disabled={{
                bg: 'gray.50',
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
              pl={leftIcon ? 10 : 3}
              pr={rightIcon ? 10 : 3}
              {...selectProps}
            >
              {normalizedOptions.map((option, index) => (
                <option 
                  key={`${option.value}-${index}`} 
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </ChakraSelect>
          )}
        />
        
        {rightIcon && (
          <InputRightElement pointerEvents="none">
            {typeof rightIcon === 'string' ? (
              <Icon as={rightIcon} color="gray.400" />
            ) : (
              rightIcon
            )}
          </InputRightElement>
        )}
      </InputGroup>
      
      {errors?.[name] ? (
        <FormErrorMessage mt={1} fontSize="sm" color="red.500">
          {errors[name].message}
        </FormErrorMessage>
      ) : helperText ? (
        <FormHelperText mt={1} fontSize="xs" color="gray.500">
          {helperText}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
};

export default SelectInput;
