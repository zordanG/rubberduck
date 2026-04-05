'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';
import { createSession } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.email('Insira um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
});

const API_URL = process.env.NEXT_PUBLIC_AUTH_URL;

type LoginFormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const result = await response.json();

      await createSession(result.accessToken, result.expiresIn);

      // toast.success('Login realizado com sucesso!');
      router.replace('/');
    } catch (error) {
      // toast.error('Erro ao acessar conta', {
      //   description: 'Verifique seu e-mail e senha e tente novamente.',
      // });

      form.setError('password', { type: 'manual', message: 'Credenciais incorretas' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='w-full sm:max-w-md border-border shadow-xl bg-card'>
      <CardHeader className='flex flex-col items-center gap-8 text-center pt-10'>
        <Logo link='/login' />
        <CardTitle className='font-bold text-3xl tracking-tight text-foreground'>Login</CardTitle>
      </CardHeader>

      <CardContent className='pb-10 px-8'>
        <form id='form-login' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='space-y-2'>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-email' className='text-base font-semibold text-foreground/90'>
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-email'
                    type='email'
                    placeholder='seu@email.com'
                    className='h-12 text-base bg-background border-input focus:ring-ring'
                    disabled={isLoading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className='flex items-center justify-between'>
                    <FieldLabel htmlFor='form-password' className='text-base font-semibold text-foreground/90'>
                      Senha
                    </FieldLabel>
                    {/* <Link
                      href='/forgot-password'
                      className='text-sm font-medium text-quaternary hover:text-primary dark:hover:text-tertiary transition-colors'
                    >
                      Esqueci minha senha
                    </Link> */}
                  </div>
                  <Input
                    {...field}
                    id='form-password'
                    type='password'
                    placeholder='Digite sua senha'
                    className='h-12 text-base bg-background border-input focus:ring-ring'
                    disabled={isLoading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className='flex flex-col gap-4 pt-2'>
              <Button
                type='submit'
                disabled={isLoading}
                variant='custom'
                size='default'
                className='w-full text base p-5'
              >
                {isLoading ? 'Carregando...' : 'Entrar'}
              </Button>

              <Link
                href='/register'
                className='text-center text-sm text-quaternary hover:text-primary dark:hover:text-tertiary transition-colors font-medium'
              >
                Não possui conta? <span className='underline'>Cadastre-se</span>
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
