import { Button } from './button';
import { Loader2, Pencil, Trash2, Eye, Check, X, Plus, Search, Filter, Download, Upload } from 'lucide-react';

export const ACTION_TYPES = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  SAVE: 'save',
  CANCEL: 'cancel',
  ADD: 'add',
  SEARCH: 'search',
  FILTER: 'filter',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
};

const ICONS = {
  [ACTION_TYPES.VIEW]: Eye,
  [ACTION_TYPES.EDIT]: Pencil,
  [ACTION_TYPES.DELETE]: Trash2,
  [ACTION_TYPES.SAVE]: Check,
  [ACTION_TYPES.CANCEL]: X,
  [ACTION_TYPES.ADD]: Plus,
  [ACTION_TYPES.SEARCH]: Search,
  [ACTION_TYPES.FILTER]: Filter,
  [ACTION_TYPES.DOWNLOAD]: Download,
  [ACTION_TYPES.UPLOAD]: Upload,
};

const BUTTON_VARIANTS = {
  [ACTION_TYPES.VIEW]: 'outline',
  [ACTION_TYPES.EDIT]: 'outline',
  [ACTION_TYPES.DELETE]: 'destructive',
  [ACTION_TYPES.SAVE]: 'default',
  [ACTION_TYPES.CANCEL]: 'outline',
  [ACTION_TYPES.ADD]: 'default',
  [ACTION_TYPES.SEARCH]: 'outline',
  [ACTION_TYPES.FILTER]: 'outline',
  [ACTION_TYPES.DOWNLOAD]: 'outline',
  [ACTION_TYPES.UPLOAD]: 'outline',
};

const BUTTON_TEXTS = {
  [ACTION_TYPES.VIEW]: 'Voir',
  [ACTION_TYPES.EDIT]: 'Modifier',
  [ACTION_TYPES.DELETE]: 'Supprimer',
  [ACTION_TYPES.SAVE]: 'Enregistrer',
  [ACTION_TYPES.CANCEL]: 'Annuler',
  [ACTION_TYPES.ADD]: 'Ajouter',
  [ACTION_TYPES.SEARCH]: 'Rechercher',
  [ACTION_TYPES.FILTER]: 'Filtrer',
  [ACTION_TYPES.DOWNLOAD]: 'Télécharger',
  [ACTION_TYPES.UPLOAD]: 'Importer',
};

const ActionButton = ({
  actionType,
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  size = 'default',
  showText = true,
  customText = null,
  iconOnly = false,
  ...props
}) => {
  const Icon = ICONS[actionType];
  const variant = BUTTON_VARIANTS[actionType] || 'default';
  const buttonText = customText || BUTTON_TEXTS[actionType] || '';

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled || isLoading}
      size={size}
      className={`flex items-center gap-2 ${iconOnly ? 'p-2' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={`h-4 w-4 ${!iconOnly && 'mr-2'} animate-spin`} />
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${!iconOnly && buttonText ? 'mr-1' : ''}`} />
      ) : null}
      
      {!iconOnly && buttonText && <span>{buttonText}</span>}
      
      {!iconOnly && actionType === ACTION_TYPES.DELETE && (
        <span className="sr-only">Supprimer</span>
      )}
    </Button>
  );
};

export default ActionButton;
