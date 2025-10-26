import React from 'react';
import { Button, Spinner, Flex, Text, Tooltip } from '@chakra-ui/react';

/**
 * Composant de bouton de soumission de formulaire
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.text='Enregistrer'] - Texte du bouton
 * @param {boolean} [props.isLoading=false] - Si le bouton est en cours de chargement
 * @param {boolean} [props.isDisabled=false] - Si le bouton est désactivé
 * @param {string} [props.colorScheme='blue'] - Couleur du bouton
 * @param {string} [props.size='md'] - Taille du bouton (sm, md, lg)
 * @param {React.ReactNode} [props.leftIcon] - Icône à gauche du texte
 * @param {React.ReactNode} [props.rightIcon] - Icône à droite du texte
 * @param {string} [props.loadingText] - Texte à afficher pendant le chargement
 * @param {string} [props.tooltip] - Info-bulle à afficher au survol
 * @param {Object} [props.buttonProps] - Propriétés supplémentaires pour le bouton
 * @returns {JSX.Element} Composant de bouton de soumission
 */
const SubmitButton = ({
  text = 'Enregistrer',
  isLoading = false,
  isDisabled = false,
  colorScheme = 'blue',
  size = 'md',
  leftIcon,
  rightIcon,
  loadingText,
  tooltip,
  buttonProps = {},
  ...rest
}) => {
  const buttonContent = (
    <Button
      type="submit"
      colorScheme={colorScheme}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled || isLoading}
      leftIcon={!isLoading && leftIcon}
      rightIcon={!isLoading && rightIcon}
      loadingText={loadingText}
      _disabled={{
        bg: 'gray.200',
        color: 'gray.500',
        cursor: 'not-allowed',
        _hover: {
          bg: 'gray.200',
        },
      }}
      {...buttonProps}
      {...rest}
    >
      {isLoading && !loadingText ? (
        <Flex align="center">
          <Spinner size="sm" mr={2} />
          <Text>Chargement...</Text>
        </Flex>
      ) : (
        text
      )}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip 
        label={tooltip} 
        placement="top" 
        hasArrow
        bg="gray.800"
        color="white"
        fontSize="sm"
        p={2}
        borderRadius="md"
      >
        <span>
          {buttonContent}
        </span>
      </Tooltip>
    );
  }

  return buttonContent;
};

export default SubmitButton;
