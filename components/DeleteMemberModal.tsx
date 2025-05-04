import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import {
  createMemberSchema,
  createVesiosuuskuntaSchema,
} from '~/shared/zodSchemas';
import handleError from '~/utils/handleError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MUTATION_AND_QUERY_KEYS } from '~/utils/utils';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GetMember } from '~/shared/types';

type Form = {
  firstName: string;
  lastName: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  phoneNumber?: string;
  email: string;
  paid?: string;
  connectionPointNumber?: string;
  comment?: string;
};

const EMPTY_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  streetAddress: '',
  zipCode: '',
  city: '',
  paid: '',
  connectionPointNumber: '',
  phoneNumber: '',
  comment: '',
};

const EMPTY_FORM_ERRORS = EMPTY_FORM_DATA;

export default function DeleteModal({
  closeModal,
  memberData,
}: {
  closeModal: () => void;
  memberData: GetMember;
}) {
  const [formData, setFormData] = useState<Form>(memberData);
  const [formErrors, setFormErrors] =
    useState<typeof EMPTY_FORM_ERRORS>(EMPTY_FORM_ERRORS);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: MUTATION_AND_QUERY_KEYS.DELETE_MEMBER,
    mutationFn: async () => {
      await axios.delete(`/api/members/${memberData.uuid}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: MUTATION_AND_QUERY_KEYS.MEMBERS,
      }),
  });

  async function handleClick() {
    try {
      await mutateAsync();
      closeModal();
      return;
    } catch (e) {
      handleError(e);
    }
  }

  return (
    <div>
      <div className="fixed top-0 left-0 z-99 h-full w-full bg-black opacity-80"></div>

      <div className="absolute top-0 grid w-full justify-items-center md:top-1/2">
        <div className="z-100 flex flex-col rounded-lg border-4 border-yellow-800 bg-gray-500">
          <div className="flex justify-end">
            <button
              className="mt-2 mr-2 hover:text-blue-300"
              onClick={() => closeModal()}
              type="button"
            >
              Sulje
            </button>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2">
            <p className="font-bold">Etunimi: {memberData.firstName}</p>
            <p className="font-bold">Sukunimi: {memberData.lastName}</p>
          </div>
          <div className="mt-5 mb-5 flex justify-center">
            <Button
              type="submit"
              className="w-72 min-w-72"
              onClick={() => void handleClick()}
            >
              Poista jäsen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorText({ text }: { text: string }) {
  if (text.length > 0) {
    return <p className="text-red-500">{text}</p>;
  }
  return null;
}

function InputBlock({
  htmlForAndName,
  labelText,
  inputPlaceholder,
  isRequired,
  errorText,
  setFormData,
  setFormDataKeyName,
  inputValue,
}: {
  htmlForAndName: string;
  labelText: string;
  inputPlaceholder: string;
  isRequired?: boolean;
  errorText: string;
  setFormData: Dispatch<SetStateAction<Form>>;
  setFormDataKeyName: keyof Form;
  inputValue?: string;
}) {
  return (
    <div className="m-2 grid">
      <label htmlFor={htmlForAndName}>
        {labelText}: {isRequired && <span className="text-red-500">*</span>}
      </label>
      <Input
        name={htmlForAndName}
        placeholder={inputPlaceholder}
        value={inputValue || ''}
        onChange={(e) =>
          setFormData((prevData) => ({
            ...prevData,
            [setFormDataKeyName]: e.target.value,
          }))
        }
      />
      <ErrorText text={errorText || ''} />
    </div>
  );
}

function FirstNameBlock({
  setFormData,
  formData,
  formErrors,
}: {
  setFormData: Dispatch<SetStateAction<Form>>;
  formData: Form;
  formErrors: typeof EMPTY_FORM_ERRORS;
}) {
  return (
    <div>
      <label htmlFor="firstName" className="mr-2">
        Etunimi: <span className="text-red-400">*</span>
      </label>
      <Input
        name="firstName"
        className="m-0"
        placeholder="Matti"
        value={formData.firstName}
        onChange={(e) => {
          setFormData((prevData) => ({
            ...prevData,
            firstName: e.target.value,
          }));
        }}
      />
      <ErrorText text={formErrors.firstName} />
    </div>
  );
}
