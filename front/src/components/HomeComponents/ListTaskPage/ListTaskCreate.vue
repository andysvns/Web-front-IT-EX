<template>
  <v-container>
    <v-row class="ml-5 mr-5">
      <v-col cols="12">
        <v-toolbar flat color="transparent">
          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title>Back</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="validateAndCreate" :disabled="!valid"
            >Add</v-btn
          >
        </v-toolbar>
      </v-col>
    </v-row>
    <v-form ref="form" v-model="valid" @submit.prevent="validateAndCreate">
      <v-row class="ml-5 mr-5">
        <v-col cols="12" md="5">
          <v-card>
            <v-card-title>List Icon</v-card-title>
            <v-card-text>
              <v-text-field
                label="Icon mdi name"
                :rules="iconRules"
                v-model="item.icon"
                outlined
              ></v-text-field>
              <v-icon size="200" color="secondary">{{ item.icon }}</v-icon>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card>
            <v-card-title>List Detail</v-card-title>
            <v-card-text>
              <v-text-field
                label="Title"
                :rules="titleRules"
                v-model="item.title"
                outlined
              ></v-text-field>
              <div class="editor-wrapper">
                <label class="v-label theme--light">Description</label>
                <vue-editor
                  v-model="item.desc"
                  :editor-toolbar="customToolbar"
                  @blur="validateDescription"
                  :class="{ 'error--text': descriptionError }"
                  class="mt-1"
                ></vue-editor>
                <div
                  v-if="descriptionError"
                  class="v-messages theme--light error--text"
                >
                  <div class="v-messages__wrapper">
                    <div class="v-messages__message">
                      Description is required
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
    <!-- Success snackbar -->
    <v-snackbar v-model="snackbarSuccess" bottom right color="success">
      <v-icon color="white" left>mdi-check-circle</v-icon>
      Item created successfully!
      <v-btn color="white" text @click="snackbarSuccess = false">Close</v-btn>
    </v-snackbar>

    <!-- Error snackbar -->
    <v-snackbar v-model="snackbarError" bottom right color="error">
      <v-icon color="white" left>mdi-alert-circle</v-icon>
      Failed to create item. Please try again.
      <v-btn color="white" text @click="snackbarError = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from "axios";
import { VueEditor } from "vue2-editor";
export default {
  name: "ContactForm",
  components: {
    VueEditor,
  },
  data() {
    return {
      valid: false,
      snackbarSuccess: false,
      snackbarError: false,
      descriptionError: false,
      item: {
        icon: "",
        title: "",
        desc: "",
        created_at: "",
        updated_at: "",
      },
      iconRules: [(v) => !!v || "Icon is required"],
      titleRules: [(v) => !!v || "Title is required"],
      descRules: [(v) => !!v || "Description required"],
      customToolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["clean"],
        
      ],
    };
  },
  methods: {
    validateDescription() {
      this.descriptionError = !this.item.desc;
      this.valid = this.$refs.form.validate() && !this.descriptionError;
      return !this.descriptionError;
    },
    goBack() {
      this.$router.go(-1);
    },
    validateAndCreate() {
      if (this.$refs.form.validate() && this.validateDescription()) {
        this.CreateItem();
      }
    },
    async CreateItem() {
      this.item.created_at = new Date().toISOString();
      this.item.updated_at = new Date().toISOString();
      try {
        const response = await axios.post(
          "http://localhost:3000/api/listtask/create/",
          this.item
        );
        if (response.status === 200) {
          this.$emit("item-created", response.data);
          this.snackbarSuccess = true; // Show success snackbar
          setTimeout(() => {
            this.$router.go(-1);
          }, 1500); // Wait for 1.5 second before navigating back
        }
      } catch (err) {
        console.error("Failed to create item:", err);
        this.snackbarError = true; // Show error snackbar
      }
    },
  },
};
</script>

