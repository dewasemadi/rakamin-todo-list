import { Show } from './show'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { getItemsById } from 'services/itemService'
import Spinner from 'components/spinner'
import Divider from './divider'
import BaseButton from './baseButton'
import PlusCircleIcon from 'assets/plus-circle.svg'
import ChecklistIcon from 'assets/checklist.svg'
import MoreHorizontalIcon from 'assets/more-horizontal.svg'
import ModalCreateOrEditItem from './modalCreateOrEditItem'
import Dropdown from './dropdown'
import OutsideWrapper from 'hooks/useOutsideWrapper'
import { Draggable } from 'react-beautiful-dnd'

interface GroupCardProps {
  todosData: any
  todoId: number
  title: string
  color?: string
  description: string
  placeholder: any
}

interface ItemCardProps {
  children: React.ReactNode
}

interface ProgressProps {
  todosData: any
  todoId: number
  itemId: number
  name: string
  progress_percentage: number
}

function ItemCard({ children }: ItemCardProps) {
  return <div className={`bg-neutral-20 p-4 border border-neutral-40 rounded-md`}>{children}</div>
}

function Progress({ todosData, todoId, itemId, name, progress_percentage }: ProgressProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const progress = progress_percentage >= 0 && progress_percentage <= 100 ? progress_percentage : 100
  const progressColor = progress === 100 ? 'bg-success' : 'bg-primary'
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const onShowDropdown = () => {
    setIsShowDropdown(true)
    const idx = todosData?.findIndex((todo: any) => todo.id === todoId)
    setCurrentIdx(idx)
  }

  const onCloseDropdown = () => {
    setIsShowDropdown(false)
  }

  return (
    <div className='flex items-center gap-2 mt-2'>
      <div className='w-full bg-gray-200 rounded-full h-4 dark:bg-neutral-30'>
        <div className={`h-4 rounded-full ${progressColor}`} style={{ width: `${progress}%` }}></div>
      </div>
      <Show when={progress < 100}>
        <p className='text-neutral-70'>{progress}%</p>
      </Show>
      <Show when={progress === 100}>
        <img src={ChecklistIcon} alt='checklist' width={22} />
      </Show>
      <div className='relative'>
        <BaseButton
          variant='text'
          startIcon={MoreHorizontalIcon}
          className='hover:bg-neutral-30 px-1'
          iconWidth={40}
          onClick={onShowDropdown}
        />
        <Show when={isShowDropdown}>
          <OutsideWrapper callback={onCloseDropdown}>
            <Dropdown
              todosData={todosData}
              currentIdx={currentIdx}
              todoId={todoId}
              itemId={itemId}
              name={name}
              progress_percentage={progress}
              onCloseDropdown={onCloseDropdown}
            />
          </OutsideWrapper>
        </Show>
      </div>
    </div>
  )
}

function setColor(color: string | undefined): any {
  switch (color) {
    case 'green':
      return {
        background: 'bg-primary-surface border-primary-border',
        header: 'text-primary border-primary',
      }
    case 'yellow':
      return {
        background: 'bg-secondary-surface border-secondary-border',
        header: 'text-secondary border-secondary',
      }
    case 'red':
      return {
        background: 'bg-danger-surface border-danger-border',
        header: 'text-danger border-danger',
      }
    case 'lime':
      return {
        background: 'bg-success-surface border-success-border',
        header: 'text-success border-success',
      }
    default:
      return {
        background: 'bg-primary-surface border-primary-border',
        header: 'text-primary border-primary',
      }
  }
}

export default function GroupCard(props: GroupCardProps) {
  const { todosData, todoId, title, color, description, placeholder } = props
  const [isShowModal, setIsShowModal] = useState(false)
  const [currentTodoId, setCurrentTodoId] = useState<number>(todoId)
  const { data, isLoading } = useQuery(['items', todoId], () => getItemsById(todoId))
  const { background, header } = setColor(color)
  const onOpenModal = () => {
    setCurrentTodoId(todoId)
    setIsShowModal(true)
  }
  const onCloseModal = () => {
    setIsShowModal(false)
  }

  return (
    <div className={`h-fit p-4 border rounded-md w-[320px] ${background}`}>
      {/* header */}
      <div>
        <h1 className={`border rounded-md py-1 px-3 w-fit text-sm ${header}`}>{title}</h1>
        <p className='text-neutral-90 mt-2 font-semibold text-sm'>{description}</p>
      </div>
      {/* body */}
      <div className='mt-4'>
        <Show when={isLoading}>
          <Spinner />
        </Show>
        <Show when={data?.length === 0}>
          <ItemCard>
            <h1 className='text-neutral-70'>No Task</h1>
          </ItemCard>
        </Show>
        <Show when={data?.length > 0}>
          <div className='flex flex-col gap-3'>
            {data?.map(({ id, name, progress_percentage }: any, idx: number) => (
              <Draggable key={id} draggableId={id.toString()} index={idx}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? '0.5' : '1' }}
                  >
                    <ItemCard>
                      <h1 className='font-bold text-neutral-90 mb-2'>{name}</h1>
                      <Divider />
                      <Progress
                        todosData={todosData}
                        todoId={currentTodoId}
                        itemId={id}
                        name={name}
                        progress_percentage={progress_percentage}
                      />
                    </ItemCard>
                  </div>
                )}
              </Draggable>
            ))}
            {placeholder}
          </div>
        </Show>
      </div>
      {/* action */}
      <BaseButton
        variant='text'
        startIcon={PlusCircleIcon}
        className='font-normal text-sm pl-0 mt-2'
        onClick={onOpenModal}
      >
        New Task
      </BaseButton>

      {/* modal for create task */}
      <Show when={isShowModal}>
        <ModalCreateOrEditItem todoId={currentTodoId} onCloseModal={onCloseModal} />
      </Show>
    </div>
  )
}
