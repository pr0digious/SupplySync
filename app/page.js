"use client"

import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from './firebase'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  g: 3
};

export default function Home() {
  // useState variable for pantry array.
  const [pantry, setPantry] = useState([])

  // useState variable for displaying add items menu. (by default it will not display until user clicks 'add').
  const [open, setOpen] = useState(false);

  // handleOpen opens the menu to add an item.
  const handleOpen = () => setOpen(true);

  // handleClose closes the menu to add an item.
  const handleClose = () => setOpen(false);

  // useState variable for setting items to be added to pantry (by default, item text field is blank).
  const [itemName, setItemName] = useState('')

  // updatePantry will display our pantry if we've added new items or removed items from our pantry. 
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({name: doc.id, ...doc.data()})
    })
    console.log(pantryList)
    setPantry(pantryList)
  }


  useEffect(() => {
    updatePantry()
  }, [])


  // addItem adds items to our pantry.
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    // Check if item exists
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count +  1})
    } else { 
      await setDoc(docRef, {count: 1})
    }
    await updatePantry()
  }

  // removeItem removes items from our pantry.
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()) {
      const {count} = docSnap.data()
      if (count === 1) {
        await deleteDoc(docRef)
      } else { 
        await setDoc(docRef, {count: count - 1})
      }
    }
    await updatePantry()
  }

  return (
    <Box
      width='100vw'
      height='100vh'
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      bgcolor={'#fff'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width='100%' direction={'row'} spacing={2}>
            <TextField 
              id='outline-basic' 
              label='Item' 
              variant='outlined' 
              fullWidth
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant='outline' bgcolor={'#9ECCFA'}
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <TextField
        id="search-bar"
        label="Search Items"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Modal>
      <Box 
        display={'flex'} 
        flexDirection={'row'} 
        justifyContent={'space-between'} 
        gap={5} width='fit'
      >
        <Button variant="contained" onClick={handleOpen}>Add</Button>
      </Box>
      <Box border={'solid'}>
        <Box width='800px' height='100px' bgcolor={'#9ECCFA'}>
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width='800px' height='150px' spacing={2} overflow={'auto'}>
          {pantry.map(({name, count}) => ( 
            <Box
              key={name}
              height='100px'
              display={'flex'}
              width={'fit'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#F8F3EA'}
              paddingX={5}
            >
              <Typography
                variant={'h3'}
                color={'#333'}
                textAlign={'center'}
                fontWeight='100'
              >
                {
                  // Capitalizes first letter of items in pantry
                  name.charAt(0).toUpperCase() + name.slice(1)            
                }
              </Typography>
              <Typography
                variant={'h3'}
                color={'#333'}
                textAlign={'center'}
                fontWeight='100'
              >
                Quantity: {count}
              </Typography>
              <Button variant='contained' onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}