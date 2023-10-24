import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  Image,
  Flex,
  VStack,
  Button,
  Heading,
  SimpleGrid,
  StackDivider,
  useColorModeValue,
  VisuallyHidden,
  List,
  ListItem,
  Center,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import recordabi from "../../utils/contractsabi/recordsideabi.json";
import { ethers } from "ethers";
import { MdLocalShipping } from "react-icons/md";

const Record = () => {
  const { id } = useParams();
  console.log(id);

  const [loading, setLoading] = useState(true);
  const [songData, setSongData] = useState();
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [likesNum, setLikesNum] = useState(0);
  const [viewsNum, setViewsNum] = useState(0);
  const [likeButtons, setLikeButtons] = useState(false);

  const loadRecordDetails = async (recordId) => {
    if (recordId > 0) {
      if (window.ethereum._state.accounts.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          import.meta.env.VITE_RECORDSIDE_ADDRESS,
          recordabi,
          signer
        );
        const accounts = await provider.listAccounts();
        setUserWalletAddress(accounts[0]);
        const recordData = await contract.recordIdtoRecord(recordId);
        const recId = Number(recordData.recordId);
        console.log(recordData);
        const tempUserId = Number(recordData.publisher);
        const publisherInfo = await contract.userIdtoUser(tempUserId);
        setSongData({ songPayload: recordData, pubPayload: publisherInfo });
        const res = await fetch(
          `https://testnets.tableland.network/api/v1/query?unwrap=true&extract=true&statement=SELECT json_object('comments',comments,'ipfs_uri',ipfs_uri,'likes',likes,'record_id',record_id,'views',views) FROM cyptochord_records_table_80001_8183 WHERE record_id = ${recId}`
        );
        if (res.status == 200) {
          const data = await res.json();
          //console.log(data);
          setLikesNum(data.likes);
          setViewsNum(data.views);
          setLoading(false);
        }
      }
    }
  };

  const updateTableLandLikes = async () => {
    //setLikeButtons(true);
    const updatedVal = likesNum + 1;
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_RECORDSIDE_ADDRESS,
        recordabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.updateLikes(id, updatedVal);
      await tx.wait();
      // window.location.reload();
    }
  };
  const updateTableLandViews = async () => {
    setLikeButtons(true);
    const updatedVal = viewsNum + 1;
    if (window.ethereum._state.accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_RECORDSIDE_ADDRESS,
        recordabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.updateViews(id, updatedVal);
      await tx.wait();
      //window.location.reload();
    }
  };

  useEffect(() => {
    if (id) {
      loadRecordDetails(id);
    }
  }, [id]);

  if (loading) {
    return <Center>Loading...</Center>;
  }

  return (
    <Container maxW={"7xl"}>
      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 18, md: 24 }}
      >
        <Flex>
          <Image
            rounded={"md"}
            alt={"song banner"}
            src={`${songData.songPayload.bannerURL}`}
            fit={"cover"}
            align={"center"}
            w={"100%"}
            h={{ base: "100%", sm: "400px", lg: "500px" }}
          />
        </Flex>
        <Stack spacing={{ base: 6, md: 10 }}>
          <Box as={"header"}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", lg: "5xl" }}
            >
              {songData.songPayload.recordName}
            </Heading>
            <Text
              color={useColorModeValue("gray.900", "gray.400")}
              fontWeight={300}
              fontSize={"2xl"}
            >
              By {songData.pubPayload.nickName}
            </Text>
          </Box>

          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={"column"}
            divider={
              <StackDivider
                borderColor={useColorModeValue("gray.200", "gray.600")}
              />
            }
          >
            <VStack spacing={{ base: 4, sm: 6 }}>
              <Text
                color={useColorModeValue("gray.500", "gray.400")}
                fontSize={"2xl"}
                fontWeight={"300"}
              >
                {songData.songPayload.description}
              </Text>
            </VStack>
            <Box>
              <Text
                fontSize={{ base: "16px", lg: "18px" }}
                color={useColorModeValue("yellow.500", "yellow.300")}
                fontWeight={"500"}
                textTransform={"uppercase"}
                mb={"4"}
              >
                Stats
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                <List spacing={2}>
                  <ListItem>Played</ListItem>
                  <ListItem>Likes</ListItem>{" "}
                </List>
                <List spacing={2}>
                  <ListItem>{viewsNum}</ListItem>
                  <ListItem>{likesNum}</ListItem>
                </List>
              </SimpleGrid>
            </Box>
          </Stack>

          {likeButtons && (
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <GridItem h="10">
                <Button onClick={updateTableLandLikes}>Like</Button>
              </GridItem>
              <GridItem h="10">
                <Button>Comment</Button>
              </GridItem>
            </Grid>
          )}
          {likeButtons && (
            <Grid templateColumns="repeat(1, 1fr)" gap={6}>
              <GridItem>
                <object data={songData.songPayload.audioURL} />
              </GridItem>
            </Grid>
          )}
          {!likeButtons && (
            <Button
              rounded={"none"}
              w={"full"}
              size={"lg"}
              py={"7"}
              bg={useColorModeValue("gray.900", "gray.50")}
              color={useColorModeValue("white", "gray.900")}
              textTransform={"uppercase"}
              _hover={{
                transform: "translateY(2px)",
                boxShadow: "lg",
              }}
              onClick={updateTableLandViews}
            >
              Listen Now
            </Button>
          )}
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

export default Record;
