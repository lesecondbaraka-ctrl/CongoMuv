import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFormContext, Controller } from 'react-hook-form';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { Calendar } from '../ui/calendar';
import { cn } from '../../lib/utils';

/**
 * Composant de sélecteur de date
 * @param {Object} props - Propriétés du composant
 * @param {string} props.name - Nom du champ dans le formulaire
 * @param {string} [props.label] - Libellé du champ
 * @param {string} [props.placeholder] - Texte d'aide dans le champ
 * @param {boolean} [props.isRequired=false] - Si le champ est obligatoire
 * @param {string} [props.helperText] - Texte d'aide sous le champ
 * @param {Date} [props.minDate] - Date minimale sélectionnable
 * @param {Date} [props.maxDate] - Date maximale sélectionnable
 * @param {boolean} [props.showTimeSelect=false] - Afficher le sélecteur d'heure
 * @param {string} [props.dateFormat='PPP'] - Format d'affichage de la date
 * @param {boolean} [props.disabled=false] - Si le champ est désactivé
 * @param {string} [props.size='md'] - Taille du champ (sm, md, lg)
 * @returns {JSX.Element} Composant de sélecteur de date
 */
const DatePicker = ({
  name,
  label,
  placeholder = 'Sélectionnez une date',
  isRequired = false,
  helperText,
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat = 'PPP',
  disabled = false,
  size = 'md',
  ...rest
}) => {
  const { control, formState: { errors } } = useFormContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return '';
    return format(date, dateFormat, { locale: fr });
  };

  return (
    <FormControl 
      id={name} 
      isInvalid={!!errors?.[name]} 
      isRequired={isRequired}
      isDisabled={disabled}
      {...rest}
    >
      {label && (
        <FormLabel htmlFor={name} mb={1} fontSize="sm" fontWeight="medium" color="gray.700">
          {label}
        </FormLabel>
      )}
      
      <Popover isOpen={isOpen} onClose={onClose} placement="bottom-start">
        <PopoverTrigger>
          <div>
            <InputGroup size={size}>
              <InputLeftElement pointerEvents="none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </InputLeftElement>
              
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                onClick={onOpen}
                disabled={disabled}
                _hover={{ bg: 'gray.50' }}
                _active={{ bg: 'gray.100' }}
                bg="white"
                borderColor="gray.300"
                height="auto"
                py={2}
                pl={10}
                pr={3}
                textAlign="left"
                fontWeight="normal"
                color={selectedDate ? 'gray.800' : 'gray.500'}
              >
                {selectedDate ? (
                  formatDate(selectedDate)
                ) : (
                  <span>{placeholder}</span>
                )}
              </Button>
              
              {selectedDate && (
                <InputRightElement>
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<span className="text-gray-400 hover:text-gray-600">×</span>}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(null);
                    }}
                    aria-label="Effacer la date"
                  />
                </InputRightElement>
              )}
            </InputGroup>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" borderColor="gray.200" boxShadow="lg">
          <Controller
            name={name}
            control={control}
            rules={{ required: isRequired ? 'Ce champ est obligatoire' : false }}
            render={({ field: { onChange, value } }) => (
              <Calendar
                mode="single"
                selected={selectedDate || value}
                onSelect={(date) => {
                  setSelectedDate(date);
                  onChange(date);
                  onClose();
                }}
                initialFocus
                disabled={disabled}
                minDate={minDate}
                maxDate={maxDate}
                locale={fr}
                className="rounded-md border"
                classNames={{
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                  day_today: "bg-gray-100 font-bold",
                  day_disabled: "text-gray-400 opacity-50",
                  day_outside: "text-gray-400 opacity-50",
                  day_hidden: "invisible",
                }}
                components={{
                  IconLeft: ({ ...props }) => (
                    <button
                      {...props}
                      className="h-4 w-4 text-gray-600 hover:text-gray-900"
                    >
                      <span className="sr-only">Mois précédent</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  ),
                  IconRight: ({ ...props }) => (
                    <button
                      {...props}
                      className="h-4 w-4 text-gray-600 hover:text-gray-900"
                    >
                      <span className="sr-only">Mois suivant</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ),
                }}
              />
            )}
          />
          
          {showTimeSelect && (
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center space-x-2">
                <select
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                  // Gestion de l'heure à implémenter
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {String(i).padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                <span className="text-gray-500">:</span>
                <select
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
                  // Gestion des minutes à implémenter
                >
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {errors?.[name] ? (
        <FormErrorMessage mt={1} fontSize="sm" color="red.500">
          {errors[name].message}
        </FormErrorMessage>
      ) : helperText ? (
        <Box mt={1} fontSize="xs" color="gray.500">
          {helperText}
        </Box>
      ) : null}
    </FormControl>
  );
};

export default DatePicker;
