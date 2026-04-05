'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createSession } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Logo from '@/components/logo';

const formSchema = z
  .object({
    username: z.string(),
    email: z.email('Insira um e-mail válido.'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres.'),
    confirmPassword: z.string(),
    provider: z.enum(['credentials']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof formSchema>;

const API_URL = process.env.NEXT_PUBLIC_AUTH_URL;

export default function Register() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      provider: 'credentials',
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);

    const { confirmPassword, ...apiData } = data;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar');
      }

      const result = await response.json();

      await createSession(result.accessToken, result.expiresIn);

      router.replace('/');
    } catch (error) {
      form.setError('email', { type: 'manual', message: 'Erro ao cadastrar. E-mail já em uso?' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='w-full sm:max-w-md border-border shadow-xl bg-card'>
      <CardHeader className='flex flex-col items-center gap-8 text-center pt-10'>
        <Logo link='/register' />
        <CardTitle className='font-bold text-3xl tracking-tight text-foreground'>Cadastre-se</CardTitle>
      </CardHeader>

      <CardContent className='pb-10 px-8'>
        <form id='form-register' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='space-y-2'>
            <Controller
              name='username'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-username' className='text-base font-semibold text-foreground/90'>
                    Nome de usuário
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-username'
                    type='text'
                    placeholder='Seu nome ou apelido'
                    className='h-12 text-base bg-background border-input focus:ring-ring'
                    disabled={isLoading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

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
                  <FieldLabel htmlFor='form-password' className='text-base font-semibold text-foreground/90 block'>
                    Senha
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-password'
                    type='password'
                    placeholder='Crie uma senha forte'
                    className='h-12 text-base bg-background border-input focus:ring-ring'
                    disabled={isLoading}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='confirmPassword'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor='form-confirm-password'
                    className='text-base font-semibold text-foreground/90 block'
                  >
                    Confirmar Senha
                  </FieldLabel>
                  <Input
                    {...field}
                    id='form-confirm-password'
                    type='password'
                    placeholder='Digite a senha novamente'
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
                form='form-register'
                disabled={isLoading}
                variant='custom'
                size='default'
                className='w-full text-base p-5'
              >
                {isLoading ? 'Cadastrando...' : 'Criar conta'}
              </Button>

              <Link
                href='/login'
                className='text-center text-sm text-quaternary hover:text-primary dark:hover:text-tertiary transition-colors font-medium'
              >
                Já possui conta? <span className='underline'>Faça login</span>
              </Link>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
