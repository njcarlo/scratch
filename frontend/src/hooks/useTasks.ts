import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apolloClient } from '../lib/graphql-client';
import { gql } from '@apollo/client';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      status
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await apolloClient.query<{ tasks: Task[] }>({ query: GET_TASKS, fetchPolicy: 'network-only' });
      if (!data) throw new Error('No data returned');
      return data.tasks;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data } = await apolloClient.mutate<{ createTask: Task }, { input: CreateTaskInput }>({ mutation: CREATE_TASK, variables: { input } });
      if (!data) throw new Error('Mutation failed');
      return data.createTask;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // We don't have the ID yet, so we use a temp ID for the UI
      const optimisticTask: Task = {
        ...newTask,
        id: 'temp-' + Date.now(),
        status: newTask.status || 'TODO',
        priority: newTask.priority || 'MEDIUM',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Task[]>(['tasks'], (old) => [optimisticTask, ...(old || [])]);
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      const { data } = await apolloClient.mutate<{ updateTask: Task }, { id: string; input: UpdateTaskInput }>({ mutation: UPDATE_TASK, variables: { id, input } });
      if (!data) throw new Error('Mutation failed');
      return data.updateTask;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map(task => task.id === id ? { ...task, ...input, updatedAt: new Date().toISOString() } : task)
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apolloClient.mutate<{ deleteTask: boolean }, { id: string }>({ mutation: DELETE_TASK, variables: { id } });
      if (!data) throw new Error('Mutation failed');
      return data.deleteTask;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.filter(task => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
  };
};

