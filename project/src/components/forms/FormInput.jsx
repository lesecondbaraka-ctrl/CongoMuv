import React from 'react';
import { Input, InputGroup, InputLeftElement, InputRightElement, FormControl, FormLabel, FormErrorMessage, FormHelperText, Icon } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

/**
 * Composant de champ de formulaire personnalisé
 * @param {Object} props - Propriétés du composant
 * @param {string} props.name - Nom du champ dans le formulaire
 * @param {string} [props.label] - Libellé du champ
 * @param {string} [props.placeholder] - Texte d'aide dans le champ
 * @param {string} [props.type='text'] - Type du champ (text, email, password, etc.)
 * @param {boolean} [props.isRequired=false] - Si le champ est obligatoire
 * @param {string} [props.helperText] - Texte d'aide sous le champ
 * @param {React.ReactNode} [props.leftIcon] - Icône à gauche du champ
 * @param {React.ReactNode} [props.rightIcon] - Icône à droite du champ
 * @param {Object} [props.rules] - Règles de validation supplémentaires
 * @param {boolean} [props.isDisabled=false] - Si le champ est désactivé
 * @param {string} [props.size='md'] - Taille du champ (sm, md, lg)
 * @param {Object} [props.inputProps] - Propriétés supplémentaires pour le champ input
 * @returns {JSX.Element} Composant de champ de formulaire
 */
const FormInput = ({
  name,
  label,
  placeholder,
  type = 'text',
  isRequired = false,
  helperText,
  leftIcon,
  rightIcon,
  rules = {},
  isDisabled = false,
  size = 'md',
  inputProps = {},
  ...rest
}) => {
  const { register, formState: { errors } } = useFormContext();
  
  // Règles de validation de base
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
        
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
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
          {...register(name, validationRules)}
          {...inputProps}
        />
        
        {rightIcon && (
          <InputRightElement>
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

export default FormInput;
