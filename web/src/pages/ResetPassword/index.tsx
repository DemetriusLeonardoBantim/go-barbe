import React, { useCallback, useRef } from 'react';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import logo from '../../assets/logo.svg';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import { useAuth } from '../../hooks/auth';
import { useToast } from '../../hooks/toast';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { Container, Content, Background, AnimationContainer } from './styles';
import api from '../../services/api';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const Singin: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { signIn } = useAuth();
  const { addToast } = useToast();
  const history = useHistory();
  const location = useLocation();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          password: Yup.string().min(6, 'Campo obrigatorio'),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Confirmacao incorreta'
          ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });
        const { password, password_confirmation } = data;
        const token = location.search.replace('?token=', '');

        if (!token) {
          console.log(token);
          console.log(Error());
          throw new Error();
        }

        await api.post('/password/reset', {
          password,
          password_confirmation,
          token,
        });

        history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
        }
        addToast({
          type: 'error',
          title: 'Error ao resetar senha',
          description: 'Ocorreu um erro ao resetar sua senha, tente novamente',
        });
      }
    },
    [signIn, addToast, location.search]
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logo} />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Resetar senha</h1>
            <Input
              icon={FiLock}
              name="password"
              type="password"
              placeholder="Nova senha"
            />

            <Input
              icon={FiLock}
              name="password_confirmation"
              type="password"
              placeholder="Confirmacao da senha"
            />
            <Button type="submit">Alterar senha</Button>
          </Form>
          <Link to="/">
            <FiLogIn />
            Voltar a tela de login
          </Link>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
};
export default Singin;
